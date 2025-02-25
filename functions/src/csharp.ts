export const csharp = [
  `public static IEnumerable<ITypeSymbol> GetBaseTypesAndThis(this ITypeSymbol? type)
{
    var current = type;
    while (current != null)
    {
        yield return current;
        current = current.BaseType;
    }
}`,
  `public static void StartGame(Game game, string token)
{
    if (string.IsNullOrEmpty(token) || game.Players.FirstOrDefault()?.Token != token)
    {
        throw new BadRequest("Only the game owner can start the game.");
    }

    InitDeck(game);
    DealCards(game);
    game.State = GameState.Playing;
    game.TurnPhase = TurnPhase.Drawing;

    game.AddEvent(new StartGameEvent());
}`,
  `public static void DealCards(Game game)
{
    foreach (Player player in game.Players)
    {
        player.Hand = new();
    }

    for (int i = 0; i < HandSizeForRound(game.Round); i++)
    {
        foreach (Player player in game.Players)
        {
            player.Hand.Add(game.Deck.Last());
            game.Deck.RemoveAt(game.Deck.Count - 1);
        }
    }

    game.Pile.Add(game.Deck.Last());
    game.Deck.RemoveAt(game.Deck.Count - 1);
}`,
  `public bool GiveItem(Item item)
{
    return ActiveItems?.AddItem(item) == true || Inventory?.AddItem(item) == true;
}`,
  `public Item? FindItem(ItemType? itemType = null)
{
    return items.FirstOrDefault(item => 
        item != null && (itemType == null || item.Type == itemType));
}`,
  `public override Schema.OneofComponent ToSchema()
{
    var schema = new Schema.OneofComponent
    {
        Life = new Schema.Life()
        {
            MaxHealth = BaseHealth,
            Health = Health,
        }
    };
    return schema;
}`,
  `private Character? FindClosestTarget(List<Character> options)
{
    if (options.Count == 0)
        return null;

    Character minChar = options[0];
    float minDistance = (minChar.Location - Owner.Location).SquareMagnitude();

    foreach (var option in options)
    {
        float distance = (option.Location - Owner.Location).SquareMagnitude();
        if (distance < minDistance)
        {
            minChar = option;
            minDistance = distance;
        }
    }

    return minChar;
}`,
  `void Start()
{
  mesh = Seb.Meshing.IcoSphere.Generate(meshRes, 0.5f).ToMesh();

  buffer = GetComponent<CityLightGenerator>().allLights;
  args = ComputeHelper.CreateArgsBuffer(mesh, buffer.count);
  cityLightMat = new Material(shader);
}`,
  `void Awake()
{
  gameCamera = FindObjectOfType<GameCamera>();

  worldRadius = heightSettings.worldRadius;

  SetStartPos(startPoint);

  baseTargetSpeed = Mathf.Lerp(minSpeed, maxSpeed, 0.35f);
  currentSpeed = baseTargetSpeed;
  SetNavigationLightScale(0);

  positionHistory = new Queue<Vector3>(maxHistorySize);
  boostTimeRemaining = boostTimeAtStart;
}`,
  `void UpdatePosition(float forwardSpeed)
{
  Vector3 newPos = transform.position + transform.forward * forwardSpeed * Time.deltaTime;
  if (worldIsSpherical)
  {
    newPos = newPos.normalized * (worldRadius + currentElevation);
  }
  else
  {
    newPos = new Vector3(newPos.x, currentElevation, newPos.z);
  }
  transform.position = newPos;
}`,
  `void UpdateBoostTimer()
{
  // Decrease boost timer when boosting
  if (boosting)
  {
    boostTimeRemaining = Mathf.Max(0, boostTimeRemaining - Time.deltaTime);
  }
  // Increase boost timer gradually when time has been gained
  if (boostTimeToAdd > 0)
  {
    const float boostAddSpeed = 4;
    float boostTimeToAddThisFrame = Mathf.Min(Time.deltaTime * boostAddSpeed, boostTimeToAdd);
    boostTimeRemaining += boostTimeToAddThisFrame;
    boostTimeToAdd -= boostTimeToAddThisFrame;
    boostTimeRemaining = Mathf.Min(boostTimeRemaining, maxBoostTime);
  }
}`,
  `void SetNavigationLightScale(float scale, bool smooth = false)
{
  for (int i = 0; i < navigationLights.Length; i++)
  {
    if (smooth)
    {
      float currentScale = navigationLights[i].localScale.x;
      navigationLights[i].localScale = Vector3.one * Mathf.Lerp(currentScale, scale, Time.deltaTime);
    }
    else
    {
      navigationLights[i].localScale = Vector3.one * scale;
    }
  }
}`,
  `public Package DropPackage()
{
  Package package = Instantiate(packagePrefab, packageDropPoint.position, packageDropPoint.rotation);
  package.Init(worldLookup);
  packageDropped?.Invoke(package);
  return package;
}`,
  `void LandParachute()
{
  parachute.transform.position += velocity * Time.deltaTime / 2;

  if (parachute.transform.position.magnitude < parachuteAttachPoint.position.magnitude)
  {
    parachute.transform.position = Vector3.ClampMagnitude(parachute.transform.position, parachuteAttachPoint.position.magnitude);
    parachuteHasLanded = true;
  }
}`,
  `void SetInitialBufferData(Spawner3D.SpawnData spawnData)
{
  positionBuffer.SetData(spawnData.points);
  predictedPositionsBuffer.SetData(spawnData.points);
  velocityBuffer.SetData(spawnData.velocities);

  foamBuffer.SetData(new FoamParticle[foamBuffer.count]);

  debugBuffer.SetData(new float3[debugBuffer.count]);
  foamCountBuffer.SetData(new uint[foamCountBuffer.count]);
  simTimer = 0;
}`,
  `public void UpdateVelocity (CelestialBody[] allBodies, float timeStep)
{
  foreach (var otherBody in allBodies) {
      if (otherBody != this) {
          float sqrDst = (otherBody.rb.position - rb.position).sqrMagnitude;
          Vector3 forceDir = (otherBody.rb.position - rb.position).normalized;

          Vector3 acceleration = forceDir * Universe.gravitationalConstant * otherBody.mass / sqrDst;
          velocity += acceleration * timeStep;
      }
  }
}`,
];

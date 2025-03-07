export const csharp = [
  `var current = type;
while (current != null)
{
    yield return current;
    current = current.BaseType;
}`,
  `if (string.IsNullOrEmpty(token) || game.Players.FirstOrDefault()?.Token != token)
{
    throw new BadRequest("Only the game owner can start the game.");
}

InitDeck(game);
DealCards(game);
game.State = GameState.Playing;
game.TurnPhase = TurnPhase.Drawing;

game.AddEvent(new StartGameEvent());`,
  `foreach (Player player in game.Players)
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
game.Deck.RemoveAt(game.Deck.Count - 1);`,
  `return ActiveItems?.AddItem(item) == true || Inventory?.AddItem(item) == true;`,
  `return items.FirstOrDefault(item => 
    item != null && (itemType == null || item.Type == itemType));`,
  `var schema = new Schema.OneofComponent
{
    Life = new Schema.Life()
    {
        MaxHealth = BaseHealth,
        Health = Health,
    }
};
return schema;`,
  `if (options.Count == 0)
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

return minChar;`,
  `mesh = Seb.Meshing.IcoSphere.Generate(meshRes, 0.5f).ToMesh();

buffer = GetComponent<CityLightGenerator>().allLights;
args = ComputeHelper.CreateArgsBuffer(mesh, buffer.count);
cityLightMat = new Material(shader);`,
  `gameCamera = FindObjectOfType<GameCamera>();

worldRadius = heightSettings.worldRadius;

SetStartPos(startPoint);

baseTargetSpeed = Mathf.Lerp(minSpeed, maxSpeed, 0.35f);
currentSpeed = baseTargetSpeed;
SetNavigationLightScale(0);

positionHistory = new Queue<Vector3>(maxHistorySize);
boostTimeRemaining = boostTimeAtStart;`,
  `Vector3 newPos = transform.position + transform.forward * forwardSpeed * Time.deltaTime;
if (worldIsSpherical)
{
  newPos = newPos.normalized * (worldRadius + currentElevation);
}
else
{
  newPos = new Vector3(newPos.x, currentElevation, newPos.z);
}
transform.position = newPos;`,
  `// Decrease boost timer when boosting
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
}`,
  `for (int i = 0; i < navigationLights.Length; i++)
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
}`,
  `Package package = Instantiate(packagePrefab, packageDropPoint.position, packageDropPoint.rotation);
package.Init(worldLookup);
packageDropped?.Invoke(package);
return package;`,
  `parachute.transform.position += velocity * Time.deltaTime / 2;

if (parachute.transform.position.magnitude < parachuteAttachPoint.position.magnitude)
{
  parachute.transform.position = Vector3.ClampMagnitude(parachute.transform.position, parachuteAttachPoint.position.magnitude);
  parachuteHasLanded = true;
}`,
  `positionBuffer.SetData(spawnData.points);
predictedPositionsBuffer.SetData(spawnData.points);
velocityBuffer.SetData(spawnData.velocities);

foamBuffer.SetData(new FoamParticle[foamBuffer.count]);

debugBuffer.SetData(new float3[debugBuffer.count]);
foamCountBuffer.SetData(new uint[foamCountBuffer.count]);
simTimer = 0;`,
  `foreach (var otherBody in allBodies) {
    if (otherBody != this) {
        float sqrDst = (otherBody.rb.position - rb.position).sqrMagnitude;
        Vector3 forceDir = (otherBody.rb.position - rb.position).normalized;

        Vector3 acceleration = forceDir * Universe.gravitationalConstant * otherBody.mass / sqrDst;
        velocity += acceleration * timeStep;
    }
}`,
];

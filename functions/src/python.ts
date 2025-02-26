export const python = [
  `def asunicode_nested(x):
    if hasattr(x, '__iter__') and not isinstance(x, (bytes, unicode)):
        return [asunicode_nested(y) for y in x]
    else:
        return asunicode(x)`,
  `def test_can_create_instance_using_kwargs(self):
    a = Article(
        id=None,
        headline="Third article",
        pub_date=datetime(2005, 7, 30),
    )
    a.save()
    self.assertEqual(a.headline, "Third article")
    self.assertEqual(a.pub_date, datetime(2005, 7, 30, 0, 0))`,
  `def page(self, number):
    """Return a Page object for the given 1-based page number."""
    number = self.validate_number(number)
    bottom = (number - 1) * self.per_page
    top = bottom + self.per_page
    if top + self.orphans >= self.count:
        top = self.count
    return self._get_page(self.object_list[bottom:top], number, self)`,
  `def getObjPositionInParent(obj):
    """Helper method for catalog based folder contents."""
    parent = aq_parent(aq_inner(obj))
    ordered = IOrderedContainer(parent, None)
    if ordered is not None:
        return ordered.getObjectPosition(obj.getId())
    return 0`,
  `def search(self, query, sort_index=None, reverse=0, limit=None, merge=1):
    processQueue()
    user = _getAuthenticatedUser(self)
    query["allowedRolesAndUsers"] = self._listAllowedRolesAndUsers(user)

    if not self.allow_inactive(query):
        query["effectiveRange"] = DateTime()

    return super().search(query, sort_index, reverse, limit, merge)`,
  `class AddonList(list):
    def upgrade_all(self, context):
        setup = getToolByName(context, "portal_setup")
        for addon in self:
            if addon.safe():
                setup.upgradeProfile(addon.profile_id, quiet=True)`,
  `def getFileSystemVersion(self):
    # The version this instance of plone is on.
    setup = getToolByName(self, "portal_setup")
    try:
        return setup.getVersionForProfile(_DEFAULT_PROFILE)
    except KeyError:
        pass
    return None`,
  `def listUpgrades(self):
    setup = getToolByName(self, "portal_setup")
    fs_version = self.getFileSystemVersion()
    upgrades = setup.listUpgrades(_DEFAULT_PROFILE, dest=fs_version)
    return upgrades`,
  `def getValidUser(self, userid):
    if get_member_by_login_name:
        registry = getUtility(IRegistry)
        settings = registry.forInterface(ISecuritySchema, prefix="plone")
        if settings.use_email_as_login:
            return get_member_by_login_name(self, userid, raise_exceptions=False)
    membertool = getToolByName(self, "portal_membership")
    return membertool.getMemberById(userid)`,
  `def clearExpired(self, days=0):
    now = datetime.datetime.utcnow()
    for key, record in list(self._requests.items()):
        stored_user, expiry = record
        if self.expired(expiry, now - datetime.timedelta(days=days)):
            del self._requests[key]
            self._p_changed = 1`,
  `def maySeeSomeConfiglets(self):
    groups = self.getGroups("site")
    all = []
    for group in groups:
        all.extend(self.enumConfiglets(group=group["id"]))
    all = [item for item in all if item["visible"]]
    return len(all) != 0`,
  `def unregisterApplication(self, appId):
    acts = list(self.listActions())
    selection = [acts.index(a) for a in acts if a.appId == appId]
    if not selection:
        return
    self.deleteActions(selection)`,
  `def __before_publishing_traverse__(self, arg1, arg2=None):
    REQUEST = arg2 or arg1
    try:
        notify(BeforeTraverseEvent(self, REQUEST))
    except ComponentLookupError:
        pass
    self.setupCurrentSkin(REQUEST)

    super().__before_publishing_traverse__(arg1, arg2)`,
  `def manage_delObjects(self, ids=None, REQUEST=None):
    if ids is None:
        ids = []
    if isinstance(ids, str):
        ids = [ids]
    for id in ids:
        item = self._getOb(id)
        if not _checkPermission(permissions.DeleteObjects, item):
            raise Unauthorized("Do not have permissions to remove this object")
    return PortalObjectBase.manage_delObjects(self, ids, REQUEST=REQUEST)`,
  `def isValidEmail(self, email):
    # Checks for valid email.
    if EMAIL_RE.search(email) is None:
        return 0
    try:
        checkEmailAddress(email)
    except EmailAddressInvalid:
        return 0
    else:
        return 1`,
  `def _checkEmail(address):
    for pattern, expected, message in _TESTS:
        matched = pattern.search(address) is not None
        if matched != expected:
            return False, message
    return True, ""`,
  `def dijkstra(self, src):
    dist = [1e7] * self.V
    dist[src] = 0
    sptSet = [False] * self.V
    for cout in range(self.V):
        u = self.minDistance(dist, sptSet)
        sptSet[u] = True
        for v in range(self.V):
            if (self.graph[u][v] > 0 and
                sptSet[v] == False and
                dist[v] > dist[u] + self.graph[u][v]):
                dist[v] = dist[u] + self.graph[u][v]`,
  `def BFS(self, s):
    visited = [False] * (max(self.graph) + 1)
    queue = []
    queue.append(s)
    visited[s] = True
    
    while queue:
        s = queue.pop(0)
        print(s, end=" ")
        for i in self.graph[s]:
            if not visited[i]:
                queue.append(i)
                visited[i] = True`,
  `def partition(array, low, high):
    pivot = array[high]
    i = low - 1
    for j in range(low, high):
        if array[j] <= pivot:
            i = i + 1
            (array[i], array[j]) = (array[j], array[i])

    (array[i + 1], array[high]) = (array[high], array[i + 1])
    return i + 1`,
  `def heapSort(arr):
    n = len(arr)
    for i in range(n // 2, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        (arr[i], arr[0]) = (arr[0], arr[i])  # swap
        heapify(arr, i, 0)`,
];

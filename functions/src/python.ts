export const python = [
  `if hasattr(x, '__iter__') and not isinstance(x, (bytes, unicode)):
    return [asunicode_nested(y) for y in x]
else:
    return asunicode(x)`,
  `a = Article(
    id=None,
    headline="Third article",
    pub_date=datetime(2005, 7, 30),
)
a.save()
self.assertEqual(a.headline, "Third article")
self.assertEqual(a.pub_date, datetime(2005, 7, 30, 0, 0))`,
  `number = self.validate_number(number)
bottom = (number - 1) * self.per_page
top = bottom + self.per_page
if top + self.orphans >= self.count:
    top = self.count
return self._get_page(self.object_list[bottom:top], number, self)`,
  `parent = aq_parent(aq_inner(obj))
ordered = IOrderedContainer(parent, None)
if ordered is not None:
    return ordered.getObjectPosition(obj.getId())
return 0`,
  `processQueue()
user = _getAuthenticatedUser(self)
query["allowedRolesAndUsers"] = self._listAllowedRolesAndUsers(user)

if not self.allow_inactive(query):
    query["effectiveRange"] = DateTime()

return super().search(query, sort_index, reverse, limit, merge)`,
  `setup = getToolByName(context, "portal_setup")
for addon in self:
    if addon.safe():
        setup.upgradeProfile(addon.profile_id, quiet=True)`,
  `setup = getToolByName(self, "portal_setup")
try:
    return setup.getVersionForProfile(_DEFAULT_PROFILE)
except KeyError:
    pass
return None`,
  `setup = getToolByName(self, "portal_setup")
fs_version = self.getFileSystemVersion()
upgrades = setup.listUpgrades(_DEFAULT_PROFILE, dest=fs_version)
return upgrades`,
  `if get_member_by_login_name:
    registry = getUtility(IRegistry)
    settings = registry.forInterface(ISecuritySchema, prefix="plone")
    if settings.use_email_as_login:
        return get_member_by_login_name(self, userid, raise_exceptions=False)
membertool = getToolByName(self, "portal_membership")
return membertool.getMemberById(userid)`,
  `now = datetime.datetime.utcnow()
for key, record in list(self._requests.items()):
    stored_user, expiry = record
    if self.expired(expiry, now - datetime.timedelta(days=days)):
        del self._requests[key]
        self._p_changed = 1`,
  `groups = self.getGroups("site")
all = []
for group in groups:
    all.extend(self.enumConfiglets(group=group["id"]))
all = [item for item in all if item["visible"]]
return len(all) != 0`,
  `acts = list(self.listActions())
selection = [acts.index(a) for a in acts if a.appId == appId]
if not selection:
    return
self.deleteActions(selection)`,
  `REQUEST = arg2 or arg1
try:
    notify(BeforeTraverseEvent(self, REQUEST))
except ComponentLookupError:
    pass
self.setupCurrentSkin(REQUEST)

super().__before_publishing_traverse__(arg1, arg2)`,
  `if ids is None:
    ids = []
if isinstance(ids, str):
    ids = [ids]
for id in ids:
    item = self._getOb(id)
    if not _checkPermission(permissions.DeleteObjects, item):
        raise Unauthorized("Do not have permissions to remove this object")
return PortalObjectBase.manage_delObjects(self, ids, REQUEST=REQUEST)`,
  `if EMAIL_RE.search(email) is None:
    return 0
try:
    checkEmailAddress(email)
except EmailAddressInvalid:
    return 0
else:
    return 1`,
  `for pattern, expected, message in _TESTS:
    matched = pattern.search(address) is not None
    if matched != expected:
        return False, message
return True, ""`,
  `dist = [1e7] * self.V
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
  `visited = [False] * (max(self.graph) + 1)
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
  `pivot = array[high]
i = low - 1
for j in range(low, high):
    if array[j] <= pivot:
        i = i + 1
        (array[i], array[j]) = (array[j], array[i])

(array[i + 1], array[high]) = (array[high], array[i + 1])
return i + 1`,
  `n = len(arr)
for i in range(n // 2, -1, -1):
    heapify(arr, n, i)
for i in range(n - 1, 0, -1):
    (arr[i], arr[0]) = (arr[0], arr[i])
    heapify(arr, i, 0)`,
];

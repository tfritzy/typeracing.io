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
  `def test_is_pk_set(self):
    def new_instance():
        a = Article(pub_date=datetime.today())
        a.save()
        return a

    cases = [
        Article(id=1),
        Article(id=0),
        Article.objects.create(pub_date=datetime.today()),
        new_instance(),
    ]
    for case in cases:
        with self.subTest(case=case):
            self.assertIs(case._is_pk_set(), True)`,
  `def page(self, number):
    """Return a Page object for the given 1-based page number."""
    number = self.validate_number(number)
    bottom = (number - 1) * self.per_page
    top = bottom + self.per_page
    if top + self.orphans >= self.count:
        top = self.count
    return self._get_page(self.object_list[bottom:top], number, self)
`,
];

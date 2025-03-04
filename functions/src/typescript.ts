export const typescript = [
  `if (await dbExists(client, dbName)) {
    logger.info(\`Database "\${dbName}" already exists\`)

    envEditor.set("DB_NAME", dbName, { withEmptyTemplateValue: true })
    await envEditor.save()
    logger.info(\`Updated .env file with "DB_NAME=\${dbName}"\`)

    return true
}`,
  `try {
  const created = await dbCreate({ directory, interactive, db });
  process.exit(created ? 0 : 1);
} catch (error) {
  if (error.name === "ExitPromptError") {
    process.exit();
  }
  logger.error(error);
  process.exit(1);
}`,
  `const plugins = await getResolvedPlugins(directory, configModule, true)
mergePluginModules(configModule, plugins)

const linksSourcePaths = plugins.map((plugin) =>
  join(plugin.resolve, "links")
)
await new LinkLoader(linksSourcePaths).load()`,
  `if (!skipLinks) {
  console.log(new Array(TERMINAL_SIZE).join("-"));
  await syncLinks(medusaAppLoader, {
    executeAll: executeAllLinks,
    executeSafe: executeSafeLinks,
  });
}`,
  `const created = await dbCreate({ directory, interactive, db });
if (!created) {
  process.exit(1);
}

const migrated = await migrate({
  directory,
  skipLinks,
  skipScripts,
  executeAllLinks,
  executeSafeLinks,
});

process.exit(migrated ? 0 : 1);`,
  `for (const path of modulePaths) {
  const moduleDirname = dirname(path);
  const serviceName = await getModuleServiceName(path);
  const entities = await getEntitiesForModule(moduleDirname);

  moduleDescriptors.push({
    serviceName,
    migrationsPath: join(moduleDirname, "migrations"),
    entities,
  });
}`,
  `await page.getByRole('link', { name: 'Content Manager' }).click();
await page.getByRole('link', { name: 'Author' }).click();
await expect(page.getByRole('gridcell', { name: 'Draft' })).toHaveCount(3);
await expect(page.getByRole('link', { name: 'Next page' })).not.toBeVisible();`,
  `await page.waitForSelector('text=Are you sure you want to delete these entries?');
const confirmDeleteButton = page
  .getByLabel('Confirm')
  .getByRole('button', { name: 'Confirm' });
await confirmDeleteButton.click();
await page.waitForSelector('text=No content found');`,
  `const pageNumber = parseInt(page, 10);
const pageSizeNumber = parseInt(pageSize, 10);

if (Number.isNaN(pageNumber) || pageNumber < 1) {
  throw new PaginationError('invalid pageNumber param');
}
if (Number.isNaN(pageSizeNumber) || pageSizeNumber < 1) {
  throw new PaginationError('invalid pageSize param');
}`,
  `if (!isNil(actionConfig)) {
  const [controller, action] = actionConfig.split(".");

  if (controller && action) {
    return controllers[controller.toLowerCase()][action](ctx, next);
  }
}`,
  `if (this.connectFailCount > this.config.maxWebSocketFails) {
  retryTime = retryTime * this.connectFailCount * this.connectFailCount;
  if (retryTime > this.config.maxWebSocketRetryTime) {
    retryTime = this.config.maxWebSocketRetryTime;
  }
}`,
  `if (msg.seq !== this.serverSequence) {
  this.connectFailCount = 0;
  this.responseSequence = 1;
  this.conn?.close();
  return;
}`,
  `if (this.conn && this.conn.readyState === WebSocket.OPEN) {
  this.conn.send(JSON.stringify(msg));
}`,
  `const category = this.getCategoryForWpm(wpm);
const prefix =
  this.prefixes[category][
    Math.floor(Math.random() * this.prefixes[category].length)
  ];
const suffix =
  this.suffixes[category][
    Math.floor(Math.random() * this.suffixes[category].length)
  ];
return \`\${prefix} Typewriter \${suffix}\`;`,
  `Date.prototype.getDayOfYear = function () {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = (this as Date).getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};`,
  `const response = await fetch(getFindGameUrl(), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    displayName: name,
    mode: mode,
  }),
});`,
];

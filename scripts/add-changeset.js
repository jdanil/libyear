const fs = require('fs');

module.exports = async ({github, context}) => {

  const {title, body, number} = context.payload.pull_request

  const response = await github.rest.pulls.listFiles({
    owner: 'Stedi',
    repo: 'libyear',
    pull_number: number,
  })
  const modifiedFiles = response.data

  const packageNames = modifiedFiles
    .filter(({filename}) => filename.endsWith('package.json'))
    .map(({filename}) => {
      const parsedPackageJson = JSON.parse(fs.readFileSync(filename).toString())
      return parsedPackageJson.name
    })

  if (packageNames.length > 0) {

    console.log({packageNames});

    let semverRange = 'patch'
    if (title?.startsWith('feat')) {
      semverRange = 'minor'
    } else if (body?.includes('BREAKING')) {
      semverRange = 'major'
    }

    const changeset = `
    ---
    ${packageNames.map((name) => `"${name}": ${semverRange}`).join('\n')}
    ---

    ${title}
    `
    console.log(changeset);
    fs.writeFileSync('.changeset/automated-changeset.md', changeset);
    return `Added changeset for ${packageNames}`
  } else {
    console.log('No changeset to write')
    return 'No changeset to write'
  }
}

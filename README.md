# Bridge

Basic proof of concept work for a developer hub using submodules from external repos to render a unified documentation site using the markdown files pulled from each submodule. 

The developer hub website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

![Preview](preview.png)

## Getting Started

To clone the repository with the files in the submodules:

```bash
git clone --recurse-submodules https://github.com/MitchellShiell/bridge.git
```

After cloning, you may wish to fetch and update the submodules:

```bash
git fetch --recurse-submodules
```

To fire up the local development server first install all the required dependencies

```
npm ci
```

Then run the following command: 

```
yarn start
```

> [!IMPORTANT]  
> Docusaurus requires node version 18 or higher

## Managing Git Submodules

### Fetching Latest Changes

To fetch the latest changes for all submodules:

```bash
git fetch --recurse-submodules
```

### Adding New Submodules

There are two ways to add new submodules:

1. Update the `.gitmodules` file manually
2. Run the following command:

```bash
git submodule add <GitHub repository URL> module_name
```

> [!NOTE]  
> You can also define a specific branch you would like to pull either from the command line or updating the .gitmodules with an `branch = branchName` entry

### Pulling Latest Changes for All Submodules

To pull the latest changes for all submodules, including any new ones:

```bash
git submodule update --recursive --remote
```

### Updating Submodule Repos Remotely

When working within a submodule:
- `cd`ing into any submodule treats it as if you cloned the repo independently
- Git operations like branching, adding, and pushing will push to the external repo
- The root directory works within the root project (e.g., the bridge repo)
This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

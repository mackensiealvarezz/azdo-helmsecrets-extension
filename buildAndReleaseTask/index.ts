import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {

        //Vaildate all input
        const filePath: string | undefined = tl.getInput('file', true);
        const variables: string | undefined = tl.getInput('variables', true);
        const mainNode: string | undefined = tl.getInput('mainNode', true);

        //Checks
        if (filePath == null || !tl.exist(filePath)) {
            tl.error("The YAML file can't be found.");
            return;
        }
        if (variables == null) {
            tl.error("Please enter some variables to insert into the file");
            return;
        }
        if (mainNode == null) {
            tl.error("Please enter a main node");
            return;
        }

        //Turn variables into array
        const variablesList = variables.split(',');
        //Filter and save only the ones we want
        const allVariables = tl.getVariables();
        const finalList = allVariables.filter(function (item, index) {
            return variablesList.some(x => x === item.name);
        });

        if (finalList.length == 0) {
            //No variables found
            tl.error("The variables you entered were not found within this build.");
            return;
        }

        //Grab content
        const yaml = require('js-yaml');
        const fs = require('fs');
        const content = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
        const arrayContent = Object.entries(content);
        //Make main node an array
        content[mainNode] = [];

        finalList.forEach(function (item) {
            let a = { 'key': item.name, 'value': item.value };
            content[mainNode].push(a);
        });

        console.log('final YAML', content);

        //save it back to the filepath
        // Create the file
        let yamlStr = yaml.safeDump(content);
        tl.writeFile(filePath, yamlStr, 'utf8');
        console.log('Saved YAML to:', filePath);

    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
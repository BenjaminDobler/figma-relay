# Angular Figma/Relay plugin

[![npm version](https://badge.fury.io/js/%40richapps%2Ffigma-relay.svg)](https://www.npmjs.com/@richapps/figma-relay)


This a proof of concept schematic implementation which allows to import component from a figma file and convert them to angular components. The Android Figma Relay plugin can be used in the figma file to add parameters to you components which will then be available as @Inputs in your angular component.

# Installation
``` npm i @richapps/figma-relay```

# Usage
In you angular project run
```ng g @richapps/figma-relay:import```

When asked enter you figma token and the shared url to your figma file (you will only be asked once and the settings will be remembered from there on).

Now you will be presented with a list of components from your figma file. Select the components you want to import.
The selected components will be generated!




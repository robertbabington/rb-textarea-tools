# rb-textarea-tools

**!!WORK IN PROGRESS!!**

This repository is contains a set of lightweight functions for improving the look and functionality of textareas.
This includes:
- **Floating labels**
- **Autogrowing textareas**
- **Mentions and highlighting**

You can install using bower: `bower install --save rb-textarea-tools`

## Instructions

### Floating labels

**rb-textarea-label** is used to bind a label to a textarea. If the length of the value of the textarea is greater than 0, the label appears.

**Usage:** 

````html
<label rb-textarea-label for="example">Username</label>
````

### Autogrow

**rb-textarea-autogrow (required)** sets the textarea to grow automatically as a user types.

**rb-max-rows (optional)** sets the maximum number of rows to which the textarea can grow. If excluded, the textarea has no maximum. Minimum is 2 rows by default.

**rb-collapse (optional)** is a boolean which determins is a textarea returns to default height when it loses focus.

**Usage:** 

````html
<textarea placeholder="Username" id="example" ng-model="myVariable" 
rb-textarea-autogrow rb-max-rows="7" rb-collapse="true"></textarea>
````

### Mentions
** PARTIAL FUNCTIONALITY **

Mentions work in a limited capacity at the moment, but will be built in the Facebook style which includes mentions highlighting.

**rb-items (required)** interpolates a set of data to loop through. At the moment data items must be called "text", e.g.
````javascript
var myArray = [{text:"Bob"}, {text:"Joey"}];
````

**rb-for (required)** binds the dropdown menu to the ID of a textarea.

**Usage:**

````html
<rb-textarea-mentions
    rb-items="{{myList}}"
    rb-for="example"
    ng-model="myVariable"
    >
</rb-textarea-mentions>
````

## To-do

The following will be added in due course:
- Animation on label
- Improved overall functionality of mentions
- Word highlighting for mentions

## Acknowledgements

- Styling in the example is inspired by Google's Material Design, which I highly recommend checking out: http://material.angularjs.org/
- For a more robust mentions system, check out Ment.io: https://github.com/jeff-collins/ment.io

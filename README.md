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

**rb-textarea-label** is used to bind a label to a textarea. If the value of the textarea is greater than 0, the label appears.

**Usage:** `<label rb-textarea-label for="example">Username</label>`

### Autogrow

**rb-textarea-autogrow (required)** sets the textarea to grow automatically as a user types.

**rb-max-rows (optional)** sets the maximum number of rows to which the textarea can grow. If excluded, the textarea has no maximum. Minimum is 2 rows by default.

**rb-collapse (optional)** is a boolean which determins is a textarea returns to default height when it loses focus.

**Usage:** 

````html
<textarea placeholder="Username" id="example" ng-model="myVariable" rb-textarea-autogrow rb-max-rows="7" rb-collapse="true"></textarea>
````

### Mentions
** NOT FUNCTIONAL **

Mentions work in a limited capacity at the moment, but will be built in the Facebook style.

## To-do

The following will be added in due course:
- Add animation to label
- Set standard appearance of dropdown list for mentions
- Improve overall functionality of mentions
- Build word highlighting for mentions

## Acknowledgements

- Styling in the example is inspired by Google's Material Design, which I highly recommend checking out: http://material.angularjs.org/
- For a more robust mentions system, check out Ment.io: https://github.com/jeff-collins/ment.io

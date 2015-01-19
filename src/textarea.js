var app = angular.module('rbTextareaSettings', []);

app.directive('rbTextareaLabel', function() {

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {

            var label = elem;
            var textarea = [];

            function checkShowStatus() {
                if(textarea[0].value.length > 0) {
                    label.css('opacity', '1');
                } else if(textarea[0].value.length <= 0) {
                    label.css('opacity', '0');
                }
            }

            attrs.$observe('for', function(result) {
                textarea = angular.element('#' + result);
                label.css('opacity', '0');

                textarea.on('keypress keydown keyup', checkShowStatus);

            });

        }
    }

});

app.directive('rbTextareaAutogrow', function() {

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {

            var textarea = elem[0];
            var defaultHeight = textarea.offsetHeight;
            var maxRows = attrs.rbMaxRows ? Math.floor(Number(attrs.rbMaxRows)) : null;

            function setTextareaHeight() {

                textarea.style.height = 'auto';

                var lineHeight = textarea.scrollHeight - textarea.offsetHeight;
                var maxHeight = (maxRows != null) ? (maxRows * (defaultHeight/2)) : null;

                var textareaHeight = (textarea.offsetHeight + (lineHeight > 0 ? lineHeight : 0));
                if(maxRows != null && textareaHeight > maxHeight) {
                    textareaHeight = maxHeight;
                }
                textarea.style.height = textareaHeight + 'px';
            }

            elem.on('keyup keydown keypress paste cut', setTextareaHeight);

            elem.on('focus click', setTextareaHeight);

            function collapse() {
                if(attrs.rbCollapse != false) {
                    textarea.style.height = defaultHeight + 'px';
                }
            };

            elem.bind('blur', collapse);

        }
    }

});


app.directive('rbTextarea', function($sce, $timeout, rbTextareaService) {

    return {
        restrict: 'AE',
        templateUrl:'../src/rb-textarea-tools.html',
        scope: {
            ngModel: '=',
            rbTextareaLabel: '@',
            rbTextareaMentions: '@'
        },
        controller: function($sce) {

            var rbTextareaCtrl = this;

            /**
             * If the label exists, its value is set to the value of this.rbTextareaLabel.
             * Otherwise it is set to an empty string.
             */
            rbTextareaCtrl.rbTextareaLabel = this.rbTextareaLabel ? this.rbTextareaLabel : ' ';

            /**
             * If rbTextareaMentions exists, its value is appended to rbTextareaCtrl.rbListItems.
             * Otherwise, it's an empty array.
             */
            rbTextareaCtrl.rbListItems = this.rbTextareaMentions ? angular.fromJson(this.rbTextareaMentions) : [];

            rbTextareaCtrl.rbFilterSearch = '';
            rbTextareaCtrl.renderedModel = $sce.trustAsHtml(this.ngModel);
        },
        controllerAs: 'rbTextareaCtrl',
        bindToController: true,
        link: function(scope, elem, attrs, ctrl) {

            var textarea = document.getElementById('rb-textarea');
            var list, listLength, listItem, stringVal, lastKeyIdx, lastCharTyped, filterSearch;

            var currentListItem = 0;

            scope.mentionsAreVisible = false;

            elem.on('keydown', function(e) {
                if(scope.rbTextareaCtrl.rbTextareaMentions) {

                    if(e.keyCode == 8 && scope.mentionsAreVisible == true && lastCharTyped == '@') {

                        $timeout(function () {
                            scope.mentionsAreVisible = false;
                        });

                    } else if(e.keyCode == 40 && scope.mentionsAreVisible == true) {

                        list = document.getElementById('rb-list');
                        listLength = list.children.length;
                        listItem = list.children[currentListItem].children[0];

                        if(listItem.hasOwnProperty('isFocused')) {

                            if((currentListItem+1) > (listLength-1)) {
                                currentListItem = 0;
                            } else {
                                currentListItem = (currentListItem+1);
                            }

                            listItem = list.children[currentListItem].children[0];
                            $timeout(function() {
                                listItem.focus();
                                listItem.isFocused = true;
                            });

                        } else {
                            $timeout(function() {
                                listItem.focus();
                                listItem.isFocused = true;
                            });
                        }

                    } else if(e.keyCode == 38 && scope.mentionsAreVisible == true) {
                        list = document.getElementById('rb-list');
                        listLength = list.children.length;
                        listItem = list.children[currentListItem].children[0];

                        if(listItem.hasOwnProperty('isFocused')) {

                            if((currentListItem-1) < 0) {
                                $timeout(function() {
                                    textarea.focus();
                                    textarea.setSelectionRange(lastKeyIdx, lastKeyIdx);
                                });
                                delete listItem.isFocused;
                            } else {
                                currentListItem = (currentListItem-1);
                                listItem = list.children[currentListItem].children[0];
                                $timeout(function() {
                                    listItem.focus();
                                    listItem.isFocused = true;
                                });
                            }
                        }
                    }

                }
            });

            elem.on('keyup', function() {
                if(scope.rbTextareaCtrl.rbTextareaMentions) {

                    stringVal = textarea.value;
                    lastCharTyped = stringVal.substr(textarea.selectionStart-1, 1);
                    var secondLastCharTyped = stringVal.substr(lastKeyIdx-1, 1);

                    if(secondLastCharTyped == '@' && lastCharTyped.indexOf(' ') >= 0) {

                        $timeout(function() {
                            scope.mentionsAreVisible = false;
                        });

                    } else if(lastCharTyped == '@' && scope.mentionsAreVisible != true) {

                        $timeout(function() {
                            scope.mentionsAreVisible = true;
                        });

                        lastKeyIdx = textarea.selectionStart;

                    }

                    var testdiv = document.getElementById('testdiv');

                    scope.rbTextareaCtrl.renderedModel = $sce.trustAsHtml(
                        scope.rbTextareaCtrl.ngModel
                    );

                    var replaceText;
                    //var replaceRegExp;
                    var testText;
                    for(var result in ctrl['rbListItems']) {
                        replaceText = ctrl['rbListItems'][result]['text'];

                        var replaceRegExp = new RegExp('@' + replaceText, 'g');

                        testText = scope.rbTextareaCtrl.renderedModel.toString().replace(replaceRegExp, '<span style="background:red">@' + replaceText + '</span>')

                        scope.rbTextareaCtrl.renderedModel = $sce.trustAsHtml(testText);

                    }

                    filterSearch = rbTextareaService.getNewFilter(stringVal, lastKeyIdx);
                    $timeout(function() {
                        scope.rbTextareaCtrl.rbFilterSearch = filterSearch;
                    })


                }
            });

            scope.enterNodeTitle = function(item) {
                var newStringVal = rbTextareaService.newInputModelAsString(stringVal, lastKeyIdx, item, filterSearch);
                /**
                 * Update the model with the new string.
                 */
                $timeout(function() {
                    scope.ngModel = newStringVal;
                    textarea.value = newStringVal;
                    scope.mentionsAreVisible = false;
                    textarea.focus();
                });
                /**
                 * Reset the defaults.
                 */
                stringVal = '';
                lastKeyIdx = '';
                currentListItem = 0;
            };

        }
    }

});

app.service('rbTextareaService', function() {

    var rbTextareaService = this;

    rbTextareaService.getNewFilter = function(str, lastKeyIndex) {
        /**
         * This regular expression looks for word characters in the substring
         */
        var reg = new RegExp('(\\w+)');
        var temptSubString = str.substr(lastKeyIndex);
        var refinedValArray = temptSubString.match(reg);
        var filterSearch;

        /**
         * If an array is extracted successfully..
         */
        if(refinedValArray != null) {
            /**
             * Assign the second array value to 'scope.filterSearch'
             * and apply the filter to the list
             */
            filterSearch = refinedValArray[1];
            return filterSearch;
        } else {
            /**
             * else if the array is null
             * the filter remains empty.
             */
            filterSearch = '';
            return filterSearch;
        }
    };

    /**
     * Pass the original string, the index at which the '@' occurs,
     * and the node title into the 'newInputModelAsString' function
     */
    rbTextareaService.newInputModelAsString = function(str, idx, item, filter) {
        /**
         * 'secondIdx' is the starting position plus the length of the filter
         */
        var secondIdx = idx+filter.length;
        /**
         * Make a substring from the start of the original string
         * to the index at which the '@' occurs. Add the node title.
         * Then add the rest of the string, starting at the 'secondIdx'
         */
        return str.substr(0, idx) + item + str.substr(secondIdx);
    };

});
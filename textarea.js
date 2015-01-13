var app = angular.module('rbTextareaSettings', []);

app.controller('myCtrl', function($scope) {
    $scope.myVariable = '';

    $scope.myList = [
        {text: 'Abcd'},
        {text: 'Abbc'},
        {text: 'Eadc'},
        {text: 'Eabc'},
        {text: 'Xaffa'}
    ]
});

app.directive('rbTextarea', function($timeout, rbTextareaService) {

    return {
        restrict: 'AE',
        template:
            '<div id="rb-textarea-wrapper">' +
                '<div ng-if="rbTextareaCtrl.rbTextareaLabel" class="rb-textarea-label">' +
                    '<p id="rb-label" ng-show="rbTextareaCtrl.ngModel">{{rbTextareaCtrl.rbTextareaLabel}}</p>' +
                '</div>' +
                '<textarea id="rb-textarea" ng-model="rbTextareaCtrl.ngModel" placeholder="{{rbTextareaCtrl.rbTextareaLabel}}"></textarea>' +
                '<form id="rb-list-wrapper" ng-if="mentionsAreVisible">' +
                    '<ul id="rb-list">' +
                        '<li ng-repeat="item in rbTextareaCtrl.rbListItems | filter:rbTextareaCtrl.rbFilterSearch track by $index" class="rb-list-item">' +
                            '<button ng-click="enterNodeTitle(item.text)">{{item.text}}</button>' +
                        '</li>' +
                    '</ul>' +
                '</form>' +
            '</div>'
        ,
        scope: {
            ngModel: '=',
            rbTextareaLabel: '@',
            rbTextareaMentions: '@'
        },
        controller: function() {

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
        },
        controllerAs: 'rbTextareaCtrl',
        bindToController: true,
        link: function(scope, elem, attrs) {

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
                            /**
                             * If the 'previous' item's index is not within the length of the list
                             * then focus on the input field and delete the 'isFocused' property from the dropdown
                             */
                            if((currentListItem-1) < 0) {
                                $timeout(function() {
                                    textarea.focus();
                                    textarea.setSelectionRange(lastKeyIdx, lastKeyIdx);
                                });
                                delete listItem.isFocused;
                                /**
                                 * or else focus on the preview list item.
                                 */
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

app.directive('rbTextareaAutogrow', function() {

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {

            var textarea = elem.find('textarea');

            elem.css('height', 'auto');

            /**
             * maxRows sets the height limit to which the textarea can grow.
             * If rbMaxRows is set as an attribute of the textarea
             * then its value is assigned to maxRows;
             * otherwise maxRows is equal to 5.
             */

            var maxRows = attrs.rbMaxRows ? Math.floor(Number(attrs.rbMaxRows)) : 5;

            /**
             * Textareas have an outer height and an inner height.
             * Use scrollHeight to determin the height of a row.
             * Textareas have 2 rows by default, therefore we
             * calculate the rowHeight to be the scrollHeight divided by 2.
             */
            var rowHeight = (textarea[0].scrollHeight / 2);
            var setRows = function() {

                textarea[0].setAttribute('rows', '2');

                var newRows = Math.floor(textarea[0].scrollHeight / rowHeight);
                /**
                 * If the inner number of rows is less than 2,
                 * then set the number of rows to 2.
                 * Else if the number of rows is greater than
                 * the height of the textarea, update the height.
                 */
                if(newRows < 2) {
                    newRows = 2;
                } else if(newRows > maxRows) {
                    newRows = maxRows;
                }

                textarea[0].setAttribute('rows', newRows);

            };

            elem.on('keyup keydown keypress paste cut', setRows);

            elem.on('focus', setRows);

            /**
             * If rbCollapse is set to true,
             * collapse the textarea when somebody clicks out of it.
             */
            var collapse = function() {

                if(attrs.rbCollapse != false) {

                    textarea[0].setAttribute('rows', '2');

                }
            };

            textarea.bind('blur', collapse);

        }
    }

});
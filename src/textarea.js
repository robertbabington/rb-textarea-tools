angular.module('rbTextareaSettings', [])

.directive('rbTextareaLabel', function() {

    return {
        restrict: 'A',
        link: function(ctrl, elem, attrs) {

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

})

.directive('rbTextareaAutogrow', function() {

    return {
        restrict: 'A',
        link: function(ctrl, elem, attrs) {

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

})


.directive('rbTextareaMentions', function($sce, $timeout, rbTextareaService) {

    return {
        restrict: 'E',
        templateUrl:'../src/rb-textarea-tools.html',
        scope: {
            ngModel: '=',
            rbItems: '@'
        },
        controller: function($sce) {

            var rbTextareaCtrl = this;

            /**
             * If rbTextareaMentions exists, its value is appended to rbTextareaCtrl.rbListItems.
             * Otherwise, it's an empty array.
             */
            rbTextareaCtrl.rbListItems = this.rbItems ? angular.fromJson(this.rbItems) : [];

            rbTextareaCtrl.rbFilterSearch = '';

        },
        controllerAs: 'rbTextareaCtrl',
        bindToController: true,
        link: function(scope, elem, attrs, ctrl) {

            var textarea,
                list,
                listLength,
                listItem,
                stringVal,
                lastKeyIdx,
                lastCharTyped,
                filterSearch;

            var currentListItem = 0;

            if(attrs.rbFor && attrs.rbFor.length > 0) {
                textarea = angular.element('#' + attrs.rbFor);
            } else {
                console.error('No textarea ID found.')
            }

            list = angular.element('#rb-list');

            ctrl.mentionsAreVisible = false;

            textarea.on('keydown', function(e) {

                if(ctrl.rbItems) {

                    if(e.keyCode == 8 && ctrl.mentionsAreVisible == true && lastCharTyped == '@') {

                        $timeout(function () {
                            ctrl.mentionsAreVisible = false;
                        });

                    } else if(e.keyCode == 40 && ctrl.mentionsAreVisible == true) {
                        list = angular.element('#rb-list');
                        listLength = list[0].children.length;
                        listItem = list[0].children[currentListItem].children[0];

                        $timeout(function() {
                            listItem.focus();
                            listItem.isFocused = true;
                        });

                    }

                }
            });

            elem.on('keydown', function(e) {
                if(e.keyCode == 40 && ctrl.mentionsAreVisible == true) {

                    if(listItem.hasOwnProperty('isFocused')) {

                        if((currentListItem+1) > (listLength-1)) {
                            currentListItem = 0;
                        } else {
                            currentListItem = (currentListItem+1);
                        }

                        listItem = list[0].children[currentListItem].children[0];
                        $timeout(function() {
                            listItem.focus();
                            listItem.isFocused = true;
                        });

                    }

                } else if(e.keyCode == 38 && ctrl.mentionsAreVisible == true) {
                    list = angular.element('#rb-list');
                    listLength = list[0].children.length;
                    listItem = list[0].children[currentListItem].children[0];

                    if(listItem.hasOwnProperty('isFocused')) {

                        if((currentListItem-1) < 0) {
                            $timeout(function() {
                                textarea[0].focus();
                                textarea[0].setSelectionRange(lastKeyIdx, lastKeyIdx);
                            });
                            delete listItem.isFocused;
                        } else {
                            currentListItem = (currentListItem-1);
                            listItem = list[0].children[currentListItem].children[0];
                            $timeout(function() {
                                listItem.focus();
                                listItem.isFocused = true;
                            });
                        }
                    }
                }
            });

            textarea.on('keyup', function() {
                if(ctrl.rbItems) {

                    stringVal = textarea[0].value;
                    lastCharTyped = stringVal.substr(textarea[0].selectionStart-1, 1);
                    var secondLastCharTyped = stringVal.substr(lastKeyIdx-1, 1);

                    if(secondLastCharTyped == '@' && lastCharTyped.indexOf(' ') >= 0) {

                        $timeout(function() {
                            ctrl.mentionsAreVisible = false;
                        });

                    } else if(lastCharTyped == '@' && ctrl.mentionsAreVisible != true) {

                        $timeout(function() {
                            ctrl.mentionsAreVisible = true;
                        });

                        lastKeyIdx = textarea[0].selectionStart;

                    }

                    filterSearch = rbTextareaService.getNewFilter(stringVal, lastKeyIdx);
                    $timeout(function() {
                        ctrl.rbFilterSearch = filterSearch;
                    })


                }
            });

            ctrl.enterNodeTitle = function(item) {
                var newStringVal = rbTextareaService.newInputModelAsString(
                    stringVal,
                    lastKeyIdx,
                    item,
                    filterSearch
                );
                /**
                 * Update the model with the new string.
                 */
                $timeout(function() {
                    ctrl.ngModel = newStringVal;
                    textarea[0].value = newStringVal;
                    ctrl.mentionsAreVisible = false;
                    textarea[0].focus();
                    textarea[0].selectionStart = lastKeyIdx+item.length+1;
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

})

.service('rbTextareaService', function() {

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
             * Assign the second array value to 'ctrl.filterSearch'
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



/*var testdiv = document.getElementById('testdiv');

 ctrl.renderedModel = $sce.trustAsHtml(
 ctrl.ngModel
 );

 var replaceText;
 //var replaceRegExp;
 var testText;
 for(var result in ctrl['rbListItems']) {
 replaceText = ctrl['rbListItems'][result]['text'];

 var replaceRegExp = new RegExp('@' + replaceText, 'g');

 testText = ctrl.renderedModel.toString().replace(
 replaceRegExp,
 '<span style="background:red">@' + replaceText + '</span>'
 );

 ctrl.renderedModel = $sce.trustAsHtml(testText);

 }*/
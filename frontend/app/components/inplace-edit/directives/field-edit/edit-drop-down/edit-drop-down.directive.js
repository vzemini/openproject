// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

angular
  .module('openproject.inplace-edit')
  .directive('inplaceEditorDropDown', inplaceEditorDropDown);

function inplaceEditorDropDown(EditableFieldsState, FocusHelper) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    require: '^workPackageField',
    templateUrl: '/components/inplace-edit/directives/field-edit/edit-drop-down/' +
      'edit-drop-down.directive.html',

    controller: InplaceEditorDropDownController,
    controllerAs: 'customEditorController',

    link: function(scope, element, attrs, fieldController) {
      var selected = scope.field.format();

      scope.fieldController = fieldController;
      scope.customEditorController.selected = selected && selected.props && selected.props.name;
      scope.fieldController.state.isBusy = true;

      scope.customEditorController.updateAllowedValues(scope.field.name).then(function() {
        fieldController.state.isBusy = false;

        if (!EditableFieldsState.forcedEditState) {
          EditableFieldsState.editAll.state || FocusHelper.focusUiSelect(element);
        }
      });
    }
  };
}
inplaceEditorDropDown.$inject = ['EditableFieldsState', 'FocusHelper'];


function InplaceEditorDropDownController($q, $scope, I18n, WorkPackageFieldConfigurationService) {
  this.allowedValues = [];
  this.nullValueLabel = I18n.t('js.inplace.null_value_label');

  this.updateAllowedValues = function(field) {
    var customEditorController = this;

    return $q(function(resolve) {
      $scope.field.getAllowedValues()
        .then(function(values) {

          var sorting = WorkPackageFieldConfigurationService
            .getDropdownSortingStrategy(field);

          if (sorting !== null) {
            values = _.sortBy(values, sorting);
          }

          if (!$scope.field.isRequired()) {
            var arrayWithEmptyOption = [{
              href: null,
              name: I18n.t('js.inplace.clear_value_label')
            }];

            values = arrayWithEmptyOption.concat(values);
          }
          customEditorController.allowedValues = values;

          resolve();
        });
    });
  };
}
InplaceEditorDropDownController.$inject = ['$q', '$scope', 'I18n',
  'WorkPackageFieldConfigurationService'];

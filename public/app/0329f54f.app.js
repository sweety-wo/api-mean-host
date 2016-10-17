"use strict";angular.module("apiMeanApp",["ngCookies","ngResource","ngSanitize","ngAnimate","ngMessages","btford.socket-io","ui.router","ngMaterial","toastr"]).config(["$mdThemingProvider",function(a){a.theme("indigo")}]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.otherwise("sign-in"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).config(["toastrConfig",function(a){angular.extend(a,{closeButton:!0,debug:!1,newestOnTop:!1,progressBar:!0,positionClass:"toast-top-right",preventDuplicates:!1,onclick:null,showDuration:"300",hideDuration:"1000",timeOut:"5000",extendedTimeOut:"1000",showEasing:"swing",hideEasing:"linear",showMethod:"fadeIn",hideMethod:"fadeOut"})}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$stateChangeStart",function(a,d){c.isLoggedInAsync(function(a){d.authenticate&&!a&&b.path("/sign-in"),!d.authenticate&&a&&b.path("/contacts")})})}]),angular.module("apiMeanApp").config(["$stateProvider",function(a){a.state("main.signin",{url:"sign-in",templateUrl:"app/account/signin/signin.html",controller:"SignInCtrl as signin",authenticate:!1}).state("main.signup",{url:"sign-up",templateUrl:"app/account/signup/signup.html",controller:"SignUpCtrl as signup",authenticate:!1}).state("main.settings",{url:"settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl as setting",authenticate:!0})}]),angular.module("apiMeanApp").controller("SettingsCtrl",["$scope","User","Auth","toastr","$mdDialog",function(a,b,c,d,e){var f=this;f.isAdmin=c.isAdmin(),f.user=c.getCurrentUser(),f.UsersArray=b.query(),f.fnUpdateProfile=function(){f.submitAttempt=!0,b.update(f.user,function(a){d.success("Profile updated successfully")},function(a){d.error("Error updating profile")})},f.fnChangePassword=function(a){a.$valid&&c.changePassword(f.user.oldPassword,f.user.newPassword).then(function(){a.$setPristine(),d.success("Password successfully changed.")})["catch"](function(a){d.error("Wrong current password")})},f.fnAddUser=function(a){e.show({locals:{editUser:angular.copy(a)},templateUrl:"app/account/settings/userModal/userModal.html",controller:"userModalCtrl as userModal"}).then(function(){f.UsersArray=b.query()})},f.fnDeleteUser=function(a,c){var g=e.confirm().title("Would you like to delete this user?").ariaLabel("DELETE").targetEvent(a).ok("DELETE").cancel("CANCEL");e.show(g).then(function(){b.remove({id:c},function(){d.success("User successfully deleted"),f.UsersArray=b.query()},function(a){d.error(a.message)})})},f.fnSettings=function(){f.isAdmin&&(f.UsersArray=b.query())}}]),angular.module("apiMeanApp").controller("userModalCtrl",["$mdDialog","editUser","User","toastr",function(a,b,c,d){var e=this;e.user=b,e.fnCloseDialog=function(){a.hide()},e.fnCloseDialogCancel=function(){a.cancel()},e.fnSaveUser=function(a){a._id?c.update(a,function(){d.success("Updated successfully"),e.fnCloseDialog()},function(a){d.error("error in updation"),e.fnCloseDialog()}):a._id||c.save(a,function(){d.success("User Added successfully"),e.fnCloseDialog()},function(a){d.error(a.message),e.fnCloseDialog()})}}]),angular.module("apiMeanApp").controller("SignInCtrl",["$scope","Auth","$location","$window","$state","toastr",function(a,b,c,d,e,f){var g=this;g.user={},g.fnSignIn=function(a){g.submitted=!0,a.$valid&&b.signin({email:g.user.email,password:g.user.password}).then(function(a){f.success("Welcome "+a.user.name),e.go("main.contacts")})["catch"](function(a){f.error("Email or password incorrect")})},g.fnLoginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("apiMeanApp").controller("SignUpCtrl",["$scope","Auth","$location","$window","toastr",function(a,b,c,d,e){var f=this;f.user={},f.errors={},f.fnSignUp=function(a){f.submitted=!0,a.$valid&&b.createUser({name:f.user.name,email:f.user.email,password:f.user.password}).then(function(){e.success("Account Created"),c.path("/login")})["catch"](function(b){e.error("Error creating account"),b=b.data,f.errors={},angular.forEach(b.errors,function(b,c){a[c].$setValidity("mongoose",!1),f.errors[c]=b.message})})},a.fnSignInOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("apiMeanApp").controller("contactCtrl",["$mdDialog","ContactsService","toastr","user","contact",function(a,b,c,d,e){var f=this;f.fnCloseDialog=function(){a.hide()},f.fnCloseDialogCancel=function(){a.cancel()},f.fnSaveContact=function(e){e._id?b.update(f.contact,function(){c.success("Contact updated Successfully"),a.hide()},function(){c.error(error.message),a.hide()}):(f.contact.userId=d._id,b.save(f.contact,function(){c.success("Contact added successfully"),f.fnCloseDialog()},function(b){c.error(b.message),a.hide()}))},f.fnInit=function(){f.contact=e}}]),angular.module("apiMeanApp").controller("ContactsCtrl",["User","toastr","$mdDialog","ContactsService","Auth",function(a,b,c,d,e){var f=this;f.user=e.getCurrentUser(),f.fnGetContacts=function(){e.isLoggedInAsync(function(b){b&&(f.ContactsArray=a.getContacts({id:f.user._id}))})},f.fnAddContact=function(){c.show({locals:{user:f.user,contact:{}},templateUrl:"app/contacts/contact/contact.html",controller:"contactCtrl as conCtrl"}).then(function(){f.fnGetContacts()})},f.fnEditContact=function(a){c.show({locals:{user:f.user,contact:a},templateUrl:"app/contacts/contact/contact.html",controller:"contactCtrl as conCtrl"}).then(function(){f.fnGetContacts()})},f.fnDeleteContact=function(a,e){var g=c.confirm().title("Would you like to delete this contact ?").ariaLabel("DELETE").targetEvent(a).ok("DELETE").cancel("CANCEL");c.show(g).then(function(){d.remove({id:e},function(){b.success("Contact removed successfully."),f.fnGetContacts()},function(){b.error("Contact not remove")})})},f.fnInit=function(){f.fnGetContacts()}}]),angular.module("apiMeanApp").config(["$stateProvider",function(a){a.state("main.contacts",{url:"contacts",templateUrl:"app/contacts/contacts.html",controller:"ContactsCtrl as contacts",authenticate:!0})}]),angular.module("apiMeanApp").factory("ContactsService",["$resource",function(a){return a("/api/contacts/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}},update:{method:"PUT"}})}]),angular.module("apiMeanApp").controller("MainCtrl",["$mdSidenav","$mdDialog","$scope","$location","Auth",function(a,b,c,d,e){var f=this;f.isLoggedIn=e.isLoggedIn,f.isAdmin=e.isAdmin,f.getCurrentUser=e.getCurrentUser,f.fnSignOut=function(){e.logout(),d.path("/sign-in")},f.fnIsActive=function(a){return a===d.path()},f.fnToggleLeft=function(){a("left").toggle()};var g;f.fnOpenMenu=function(a,b){g=b,a(b)}}]),angular.module("apiMeanApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl as main","abstract":!0,authenticate:!0})}]),angular.module("apiMeanApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{signin:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(function(){i.resolve(a)}),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("apiMeanApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}},getContacts:{method:"GET",params:{controller:"contacts"},isArray:!0},update:{method:"PUT"}})}]),angular.module("apiMeanApp").directive("passwordVerify",function(){return{require:"ngModel",scope:{passwordVerify:"="},link:function(a,b,c,d){a.$watch(function(){var b;return(a.passwordVerify||d.$viewValue)&&(b=a.passwordVerify+"_"+d.$viewValue),b},function(b){b&&d.$parsers.unshift(function(b){var c=a.passwordVerify;return c!==b?void d.$setValidity("passwordVerify",!1):(d.$setValidity("passwordVerify",!0),b)})})}}}),angular.module("apiMeanApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,syncUpdates:function(a,b,d){d=d||angular.noop,c.on(a+":save",function(a){var c=_.find(b,{_id:a._id}),e=b.indexOf(c),f="created";c?(b.splice(e,1,a),f="updated"):b.push(a),d(f,a,b)}),c.on(a+":remove",function(a){var c="deleted";_.remove(b,{_id:a._id}),d(c,a,b)})},unsyncUpdates:function(a){c.removeAllListeners(a+":save"),c.removeAllListeners(a+":remove")}}}]),angular.module("apiMeanApp").run(["$templateCache",function(a){a.put("app/account/settings/settings.html",'<md-content ng-init=setting.fnSettings()><div layout=row layout-xs=column layout-margin><!-- START : Update Profile Section--><div layout=column class=md-whiteframe-z1 flex><md-toolbar class=md-hue-1><div class=md-toolbar-tools><h3 class=md-toolbar-tools layout-align="center center">Update Profile</h3></div></md-toolbar><md-content flex layout-margin><form name=updateProfile layout=column novalidate><md-input-container><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-user m-t-5"></md-icon><input required name=name placeholder=Name ng-model=setting.user.name><div ng-messages=updateProfile.name.$error><div ng-message=required>This field is required.</div></div></md-input-container><md-input-container><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-envelope m-t-5"></md-icon><input name=email placeholder=Email ng-model=setting.user.email disabled></md-input-container><md-input-container><label>Role</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-briefcase m-t-5"></md-icon><input required placeholder=Role name=role ng-model=setting.user.role disabled></md-input-container><md-button type=submit ng-click="updateProfile.$valid && setting.fnUpdateProfile()" class="md-raised md-primary md-hue-1">Update</md-button></form></md-content></div><!-- END : Update Profile Section--><!-- START : Change Password Section--><div layout=column class=md-whiteframe-z1 flex><md-toolbar class="md-raised md-primary md-hue-1"><div class=md-toolbar-tools><h3 class="text-center text-white">Change Password</h3></div></md-toolbar><md-content layout=column layout-margin><form class=form layout=column name=changePassword novalidate><md-input-container><label>Current Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-lock m-t-5"></md-icon><input required type=password name=password class=form-control ng-model="setting.user.oldPassword"><div ng-messages=changePassword.password.$error><div ng-message=required>This field is required.</div></div></md-input-container><md-input-container><label>New Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-key m-t-5"></md-icon><input type=password name=newPassword class=form-control ng-model=setting.user.newPassword ng-minlength=3 required><div ng-messages=changePassword.newPassword.$error><div ng-message=required>This field is required.</div></div></md-input-container><md-input-container><label>Re-type New Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-key m-t-5"></md-icon><input required type=password name=newPassword_c class=form-control ng-model=setting.user.newPassword_c password-verify="setting.user.newPassword"><div ng-messages=changePassword.newPassword_c.$error><div ng-message=required>This field is required.</div></div></md-input-container><md-button type=submit class="md-raised md-primary md-hue-1" ng-click="changePassword.$valid && setting.fnChangePassword(changePassword)">Save changes</md-button></form></md-content></div><!-- END : Change Password Section--></div><!--User Info Section Starts Here--><div class=users-settings-container layout=row layout-margin ng-if="setting.user.role==\'admin\'"><div layout=column md-whiteframe=4 flex><md-toolbar class=md-hue-1><div class=md-toolbar-tools><div class=md-headline>Users</div><span flex=""></span><md-button class="md-fab md-mini md-primary" aria-label=Favorite ng-click="setting.fnAddUser({role:\'user\'});"><md-tooltip md-direction=left>Add User</md-tooltip><md-icon md-font-set="fa fa-2x fa-plus"></md-icon></md-button></div></md-toolbar><md-content><md-list-item class=md-2-line ng-repeat="user in setting.UsersArray" ng-cloak><div class=md-list-item-text layout=column><div class=md-title>{{ user.name }}</div><div class=md-caption>Email: {{ user.email }}</div><div class=md-caption>Role: {{ user.role }}</div></div><div class=md-secondary><md-icon ng-click=setting.fnAddUser(user); class=md-primary md-font-set="fa fa-lg fa-edit"></md-icon><md-icon ng-click=setting.fnDeleteUser($event,user._id) class=md-warn md-font-set="fa fa-lg fa-trash"></md-icon></div><md-divider></md-divider></md-list-item></md-content></div></div></md-content>'),a.put("app/account/settings/userModal/userModal.html",'<md-dialog style="width: 50%"><md-toolbar><div layout=row class=md-toolbar-tools layout-align="space-between center"><div><span ng-bind="userModal.user._id ? \'Update user\':\'Add user\'"></span></div><md-button ng-click=userModal.fnCloseDialogCancel()><md-icon md-font-set="fa fa-lg fa-close m-t-5"></md-icon><md-tooltip>close</md-tooltip></md-button></div></md-toolbar><md-content><form name=userModalForm novalidate><div layout=column layout-margin><md-input-container><label>Name</label><md-icon class=md-primary md-font-set="fa fa-lg fa-user m-t-5"></md-icon><input required name=name ng-model=userModal.user.name><div ng-messages=userModalForm.name.$error><div ng-message=required>This is required.</div></div></md-input-container><md-input-container><label>Email</label><md-icon class=md-primary md-font-set="fa fa-lg fa-envelope m-t-5"></md-icon><input required name=email type=email ng-model=userModal.user.email><div ng-messages=userModalForm.email.$error><div ng-message=required>This is required.</div><div ng-message=email>This field must be a valid email address.</div></div></md-input-container><md-input-container ng-if=!userModal.user._id><label>Password</label><md-icon class=md-primary md-font-set="fa fa-lg fa-lock m-t-5"></md-icon><input required name=password type=password ng-model=userModal.user.password><div ng-messages=userModalForm.password.$error><div ng-message=required>This is required.</div></div></md-input-container><md-input-container ng-if=!userModal.user._id><label>Confirm Password</label><md-icon class=md-primary md-font-set="fa fa-lg fa-lock m-t-5"></md-icon><input required name=password_c type=password ng-model=userModal.user.password_c password-verify=userModal.user.password><div ng-messages=userModalForm.password_c.$error><div ng-message=required>This is required.</div><div ng-message=passwordVerify>Password doesn\'t match.</div></div></md-input-container><md-input-container><md-icon class=md-primary md-font-set="fa fa-lg fa-briefcase m-t-5"></md-icon><label>Role</label><md-select ng-model=userModal.user.role><md-option value=user>User</md-option><md-option value=guest>Guest</md-option></md-select></md-input-container><div layout=row layout-align="end end"><md-button aria-label=Add type=submit ng-click="userModalForm.$valid && userModal.fnSaveUser(userModal.user);" class="md-raised md-primary" ng-bind="userModal.user._id ? \'Update user\':\'Add user\'"></md-button><md-button class="md-raised md-warn" ng-click=" userModal.fnCloseDialogCancel()">Cancel</md-button></div></div></form></md-content></md-dialog>'),a.put("app/account/signin/signin.html",'<md-content class=md-padding><md-card class=login-card><md-toolbar class=md-hue-1 layout=column layout-align="center center"><h2 class=md-headline>Sign In</h2></md-toolbar><md-card-content><form name=form ng-submit=signin.fnSignIn(form) novalidate><div layout=column><md-input-container class="md-icon-float md-block"><label>Email</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-fw fa-envelope m-t-5"></md-icon><input required type=email name=email ng-model="signin.user.email"><div ng-messages=form.email.$error><div ng-message=required>This is required.</div><div ng-message=email>This field must be a valid email address.</div></div></md-input-container></div><div layout=column><md-input-container class=md-block><label>Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-fw fa-lock m-t-5"></md-icon><input required type=password name=password ng-model=signin.user.password><div ng-messages=form.password.$error><div ng-message=required>This is required.</div></div></md-input-container></div><div layout=column><md-button class="md-raised md-primary md-hue-1" type=submit>Sign in</md-button><md-button class=md-primary type=submit ui-sref=main.signup>Sign up</md-button></div></form></md-card-content></md-card></md-content>'),a.put("app/account/signup/signup.html",'<md-content class=md-padding><md-card class=register-card><md-toolbar layout=column layout-align="center center" class=md-hue-1><h2 class="md-headline text-center">Sign Up</h2></md-toolbar><md-card-content><!--<h2 class="md-display-1 text-center">Sign up</h2>--><form name=form ng-submit=signup.fnSignUp(form) novalidate><div layout=column><md-input-container><label>Name</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-user m-t-5"></md-icon><input required name=name ng-model=signup.user.name><div ng-messages=form.name.$error><div ng-message=required>This is required.</div></div></md-input-container></div><div layout=column><md-input-container><label>Email</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-envelope m-t-5"></md-icon><input required name=email type=email ng-model=signup.user.email><div ng-messages=form.email.$error><div ng-message=required>This is required.</div><div ng-message=email>This field must be a valid email address.</div></div></md-input-container></div><div layout=column><md-input-container><label>Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-lock m-t-5"></md-icon><input required type=password name=password ng-model=signup.user.password><div ng-messages=form.password.$error><div ng-message=required>This is required.</div></div></md-input-container></div><div layout=column><md-input-container><label>Confirm Password</label><md-icon class="md-primary md-hue-1" md-font-set="fa fa-lg fa-lock m-t-5"></md-icon><input required password-verify=signup.user.password type=password name=password_c ng-model=signup.user.password_c><div ng-messages=form.password_c.$error><div ng-message=required>This is required.</div><div ng-message=passwordVerify>Password doesn\'t match.</div></div></md-input-container></div><div layout=column><md-button class="md-raised md-primary md-hue-1" type=submit>Sign up</md-button><md-button class=md-primary ui-sref=main.signin>Sign in</md-button></div></form></md-card-content></md-card></md-content>'),a.put("app/contacts/contact/contact.html",'<md-dialog style="width: 50%" ng-init=conCtrl.fnInit();><md-toolbar><div layout=row class=md-toolbar-tools layout-align="space-between center"><div><span ng-bind="conCtrl.contact._id ? \'Update contact\':\'Add contact\'"></span></div><md-button ng-click=conCtrl.fnCloseDialogCancel()><md-icon md-font-set="fa fa-lg fa-close m-t-5"></md-icon><md-tooltip>close</md-tooltip></md-button></div></md-toolbar><md-content><form name=contactForm novalidate><div layout=column layout-margin><md-input-container><label>Name</label><md-icon class="md-primary md-icon-float" md-font-set="fa fa-lg fa-user m-t-5"></md-icon><input required name=name ng-model="conCtrl.contact.name"><div ng-messages=contactForm.name.$error><div ng-message=required>This is required.</div></div></md-input-container><md-input-container><label>Email</label><md-icon class=md-primary md-font-set="fa fa-lg fa-envelope m-t-5"></md-icon><input required type=email name=email ng-model="conCtrl.contact.email"><div ng-messages=contactForm.email.$error><div ng-message=required>This is required.</div><div ng-message=email>This field must be a valid email address.</div></div></md-input-container><md-input-container><label>Phone</label><md-icon class=md-primary md-font-set="fa fa-lg fa-phone m-t-5"></md-icon><input required type=number name=phone ng-model="conCtrl.contact.phone"><div ng-messages=contactForm.phone.$error><div ng-message=required>This is required.</div></div></md-input-container><div layout=row layout-align="end none"><md-button aria-label=Add type=submit ng-click="contactForm.$valid && conCtrl.fnSaveContact(conCtrl.contact);" class="md-raised md-primary" ng-bind="conCtrl.contact._id ? \'Update contact\':\'Add contact\'"></md-button><md-button class="md-raised md-warn" ng-click=conCtrl.fnCloseDialogCancel()>Cancel</md-button></div></div></form></md-content></md-dialog>'),a.put("app/contacts/contacts.html",'<md-content ng-cloak ng-init=contacts.fnInit() layout=column layout-fill flex><md-toolbar class="md-whiteframe-2dp md-hue-1"><div class=md-toolbar-tools><h2 ui-sref=main.contacts><a href=javascript:void(0);>Contacts</a></h2><span flex=""></span><md-button class="md-fab md-mini md-primary" aria-label=Favorite ng-click=contacts.fnAddContact();><md-tooltip md-direction=left>Add Contact</md-tooltip><md-icon md-font-set="fa fa-2x fa-plus"></md-icon></md-button></div></md-toolbar><div layout=row ng-if=!contacts.ContactsArray.length layout-align="center center"><h1 class="md-headline m-b-35 m-t-35">Click "+" to add a contact.</h1></div><div layout=column layout-fill flex><md-content><md-list-item class=md-2-line ng-repeat="cont in contacts.ContactsArray"><div class=md-list-item-text layout=column><div class=md-title>{{ cont.name }}</div><div class=md-caption>Email: {{ cont.email }}</div><div class=md-caption>Phone: {{ cont.phone }}</div></div><div class=md-secondary><md-icon md-font-set="fa fa-lg fa-fw fa-trash" class=md-warn ng-click="contacts.fnDeleteContact($event, cont._id)" aria-label=delete></md-icon><md-icon ng-click=contacts.fnEditContact(cont) md-font-set="fa fa-lg fa-fw fa-pencil" class=md-primary aria-label=Chat></md-icon></div><md-divider></md-divider></md-list-item></md-content></div></md-content>'),a.put("app/main/main.html",'<div layout=column><md-sidenav ng-if=main.isLoggedIn() class="md-sidenav-left md-whiteframe-z2" md-component-id=left><md-toolbar class="md-tall md-accent"><div layout=column layout-padding class=profile-container><div flex></div><div layout-padding layout=column><div class=profile-name>{{ main.getCurrentUser().name }}</div><div class=profile-email>{{ main.getCurrentUser().email }}</div></div></div></md-toolbar><md-content class=navigation-list><md-list ng-click=main.fnToggleLeft() ng-cloak flex><md-list-item ui-sref=main.contacts ui-sref-active=active><md-icon md-font-set="fa fa-lg fa-fw fa-book m-t-16 m-r-5"></md-icon><p>Contacts</p></md-list-item></md-list><md-divider></md-divider></md-content></md-sidenav><md-toolbar><div class=md-toolbar-tools><md-button ng-if=main.isLoggedIn() ng-click=main.fnToggleLeft() class=md-icon-button aria-label=Settings><md-icon md-font-set="fa fa-lg fa-reorder m-t-5"></md-icon></md-button><h2><span>API MEAN</span></h2><span flex=""></span><md-menu ng-if=main.isLoggedIn()><md-button aria-label="Open phone interactions menu" class=md-icon-button ng-click="main.fnOpenMenu($mdOpenMenu, $event)"><md-icon md-menu-origin md-font-set="fa fa-lg fa-ellipsis-v m-t-5"></md-icon></md-button><md-menu-content width=4><md-menu-item><md-button ui-sref=main.settings><md-icon md-font-set="fa fa-lg fa-cog"></md-icon>Settings</md-button></md-menu-item><md-menu-divider></md-menu-divider><md-menu-item ng-show=main.isLoggedIn()><md-button ng-click=main.fnSignOut()><md-icon md-font-set="fa fa-lg fa-power-off"></md-icon>Logout</md-button></md-menu-item></md-menu-content></md-menu></div></md-toolbar><ui-view layout=column layout-fill flex></ui-view></div>')}]);
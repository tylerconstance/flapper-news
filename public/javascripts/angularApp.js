var app = angular.module('flapperNews', ['ui.router']);

app.controller('MainCtrl', [
  '$scope',
  'posts',
  function($scope, posts){
    $scope.test = "Hello, world!";
    // Two-way data binding only applies to variables bound to $scope,
    // So we need to mirror the array.
    $scope.posts= posts.posts;

    $scope.addPost = function(){
      // Don't let the user enter a blank post
      if (!$scope.title || $scope.title === ''){return;}
      // Push the post object to the posts array

      posts.create({
        title: $scope.title,
        link: $scope.link,
      });

      // Previous method to push post to the array
      // $scope.posts.push({
      //   title: $scope.title,
      //   link: $scope.link,
      //   upvotes: 0,
      //   comments: [
      //     {author: 'Joe', body: 'Cool post!', upvotes: 0},
      //     {author: 'Bob', body: 'Great idea, but everything is wrong!', upvotes: 0}
      //   ]
      // });


      // Reset the title & link variables
      $scope.title = '';
      $scope.link = '';
    };

    // Old, impermanent way
    // $scope.incrementUpvotes = function(post){
    //   post.upvotes++;
    // };
    $scope.incrementUpvotes = function(post){
      posts.upvote(post);
    };
  }// End controller function

]); // End controller
  app.factory('posts', ['$http', function($http){
    var o = {
      posts: []
    };

    // Loading posts
    // Query backend

    o.getAll = function() {
      return $http.get('/posts').success(function(data){

        // It's important to use the angular.copy() method to create a deep copy
        // of the returned data. This makes sure $scope.posts in the main controller
        // Is also updated (and will show up in our view)
        angular.copy(data, o.posts);
      });
    } // End getAll method

    o.create = function(post){
      return $http.post('/posts', post).success(function(data){
        o.posts.push(data);
      });
    } // End create method

    o.upvote = function(post) {
      return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data){
        post.upvotes += 1;
      });
    }; // End upvote method

    o.get = function(id) {
      console.log("Calling the thing with id " + id);
      return $http.get('/posts/' + id).then(function(res){
        console.log("Returning " + res.data);
        return res.data;
      });
    }; // End method to get a simple post

    o.addComment = function(id,comment) {
      return $http.post('/posts/' + id + '/comments',comment);
    };

    o.upvoteComment = function(post, comment) {
      console.log("So close");
      return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
        .success(function(data){
          console.log("What.");
          comment.upvotes += 1;
        }).error(function(e){
          console.log("Not sure what happened.");
          console.log(e);
        });
    }; // End upvoteComment

     return o;
  }]); // End factory function

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
      $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
          // the resolve property should call the getAll method
          // at an appropriate time
          postPromise: ['posts', function(posts){
            return posts.getAll();
          }]
        }
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
      });

    $urlRouterProvider.otherwise('home');
  }]); // End config

app.controller('PostsCtrl', [
  '$scope',
  // '$stateParams',
  'posts',
  'post',
  function($scope, posts, post){
    // Old, before injection
    // $scope.post = posts.posts[$stateParams.id];
    $scope.post = post;

    $scope.addComment = function(){
      // Prevent the user from submitting a blank comment
      if ($scope.body === ''){return;}
      posts.addComment(post._id, {
        body: $scope.body,
        author: 'user',
      }).success(function(comment){
        $scope.post.comments.push(comment);
      });
      $scope.body = '';
    }; // End addComment function

    $scope.incrementUpvotes = function(comment){
      console.log("In the controllers increment thing");
      posts.upvoteComment(post, comment);
    };

//  Old way
      // Push the comment to the comments array
    //   $scope.post.comments.push({
    //     body: $scope.body,
    //     author: 'user',
    //     upvotes: 0
    //   });
    //
    //   // Reset the body
    //   $scope.body = '';

    // };

    // $scope.incrementUpvotes = function(post){
    //   post.upvotes++;
    // };

  }]);

"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $submitStoryForm.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $submitStoryForm.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  putStoriesOnPage();
}

$submitLink.on("click", submitLinkClick)

function submitLinkClick(evt) {
  console.log($submitStoryForm);
  console.debug("submitLinkClick", evt);
  $submitStoryForm.show();
  $allStoriesList.empty();
  // $submitStoryForm.toggleClass('hidden');
  // hidePageComponents();
}

$favoritesLink.on('click', favoritesLinkClick)

function favoritesLinkClick(evt) {
  $submitStoryForm.hide();
  $loginForm.hide();
  $signupForm.hide();

  let favorites = currentUser.favorites;
  let $favoritesList = $();

  for (let storyObj of favorites) {
    let storyId = storyObj.storyId;
    let story = storyList.stories.find(story => story.storyId === storyId);
    if(story) {
      $favoritesList = $favoritesList.add(generateStoryMarkup(story));
    }
  }

  $allStoriesList.empty();
  $allStoriesList.append($favoritesList);
}

$storiesLink.on('click', myStoriesLinkClick)

function myStoriesLinkClick(evt) {
  $submitStoryForm.hide();
  $loginForm.hide();
  $signupForm.hide();

  let userStories = currentUser.ownStories;
  let $userStoriesList = $();

  for (let storyObj of userStories) {
    let storyId = storyObj.storyId;
    let story = storyList.stories.find(story => story.storyId === storyId);
    if(story) {
      $userStoriesList = $userStoriesList.add(generateMyStoryMarkup(story));
    }
  }
  $allStoriesList.empty();
  $allStoriesList.append($userStoriesList);
}
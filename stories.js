"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  if(currentUser === undefined){
    return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="fa-star far"> </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  }
  else if(isStoryFavorite(story)) {
    return $(`
    <li id="${story.storyId}">
      <span class="star">
        <i class="fa-star far fill-star"> </i>
      </span>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${story.getHostName()})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `)
  }
  else {
    return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="fa-star far"> </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  }
  
}

function generateMyStoryMarkup(story) {
  return $(`
    <li id="${story.storyId}">
      <span class="trash">
        <i class="fas fa-trash-alt"></i>
      </span>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${story.getHostName()})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `)
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(clickedStoryId) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  if(!clickedStoryId){
    for (let story of storyList.stories) {
      let isFavorite = isStoryFavorite(story);
      const $story = $(`
        <li id="${story.storyId}">
          <span class="star">
            <i class="fa-star far ${isFavorite ? 'fill-star' : ''}"> </i>
          </span>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${story.getHostName()})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
      $allStoriesList.append($story);
    }
    $allStoriesList.show();
  }
  else {
    let userStories = currentUser.ownStories;
    let $userStoriesList = $();

    for (let storyObj of userStories) {
      let storyId = storyObj.storyId;
      let story = storyList.stories.find(story => story.storyId === storyId);
      if(story && story.storyId !== clickedStoryId) {
        $userStoriesList = $userStoriesList.add(generateMyStoryMarkup(story));
      }
    }
    $allStoriesList.empty();
    $allStoriesList.append($userStoriesList);
  }
    
}

function isFavoritesArrEmpty() {
  let str = localStorage.getItem("favorites");
  let favArr = JSON.parse(str);
  if(favArr.length > 0) {
    return false;
  }
  else {
    return true;
  }
}

function isStoryFavorite(story) {
  let str = localStorage.getItem("favorites");
  let favArr = JSON.parse(str);
  return favArr.some(favStory => favStory.storyId === story.storyId);
}



$submitButton.on('click', submitNewStory);

async function submitNewStory() {
  let storyObj = {
    author: $authorInput.val(),
    title: $titleInput.val(),
    url: $urlInput.val()
  }

  let newStory = await storyList.addStory(currentUser, storyObj);
  currentUser.ownStories.push(newStory);
  putStoriesOnPage();
  $submitStoryForm.hide();
  console.log(newStory);
}



function validURL(url) {
  try {
    let newURL = new URL(url);
    return true;
  } 
  catch (error) {
    return false;
  }
}

$allStoriesList.on('click', '.star', updateFavorites)

async function updateFavorites(evt) {
  const $starIcon = $(evt.currentTarget);
  const storyClickedId = $starIcon.closest('li').attr('id');

  let favoritesArr = currentUser.favorites;

  if(currentUser) {
    if(favoritesArr.length < 1) {
      const storyClicked = await axios({
        url: `${BASE_URL}/stories/${storyClickedId}`,
        method: "get",
      });
      currentUser.addToFavorites(storyClicked.data.story);
      $(this).children().addClass('fill-star');
    }
    else {
      const favorite = favoritesArr.some(favStory => favStory.storyId === storyClickedId);

      if(!favorite) {
        const storyClicked = await axios({
          url: `${BASE_URL}/stories/${storyClickedId}`,
          method: "get",
        });
        currentUser.addToFavorites(storyClicked.data.story);
        $(this).children().addClass('fill-star');
      }
      else {
        currentUser.removeFromFavorites(storyClickedId);
        $(this).children().removeClass('fill-star');
      }
    }
  }
}



$body.on('click', '.trash', updateMyStories);


function updateMyStories(evt) {
  const $trashIcon = $(evt.currentTarget);
  const clickedStoryId = $trashIcon.parent().attr('id');

  storyList.removeStory(currentUser, clickedStoryId);

  putStoriesOnPage(clickedStoryId);
  // storyList.stories = storyList.stories.filter(story => story.storyId !== clickedStoryId);
  // currentUser.ownStories = currentUser.ownStories.filter(story => story.storyId !== clickedStoryId);
}


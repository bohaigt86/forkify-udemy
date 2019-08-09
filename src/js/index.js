import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";

import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

import { elements, renderLoader, clearLoader } from "./views/base";
/**  Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;

/**
 * Search controller
 */

const ctrlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();

  if (query) {
    // New search object and add to state
    state.search = new Search(query);

    // Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResults);

    try {
      // Search for recipes
      await state.search.getResults();

      // render result on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Something wrong with the search.");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  ctrlSearch();
});

elements.searchResultsPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * Recipe controller
 */
const ctrlRecipe = async () => {
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    console.log("state.search: ", state.search);
    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render recipe
      clearLoader();
      console.log(
        `This recipe is${state.likes.isLiked(id) ? " " : " not "}liked.`
      );
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener("hashchange", ctrlRecipe);
// window.addEventListener("load", ctrlRecipe);

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, ctrlRecipe)
);
/**
 * List controller
 */

const ctrlList = () => {
  if (!state.list) state.list = new List();

  state.recipe.ingredients.forEach(ing => {
    const item = state.list.addItem(ing.count, ing.unit, ing.ingredient);
    listView.renderItem(item);
  });
};

// Handling list button clicks

elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  console.log(id);

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);

    listView.deleteItem(id);
    // Handle count update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

/**
 * Like controller
 */
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumOfLikes());

const ctrlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const curRecipe = state.recipe;
  const curID = curRecipe.id;

  if (!state.likes.isLiked(curID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      curID,
      curRecipe.title,
      curRecipe.author,
      curRecipe.img
    );
    // Toggle the like button
    likesView.toggleLikeBtn(true);
    // Add like to the UI list
    console.log(state.likes);
    // User has liked current recipe
  } else {
    // Remove like to the state
    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like to the UI list
    state.likes.deleteLike(curID);
    console.log(state.likes);
  }

  likesView.toggleLikeMenu(state.likes.getNumOfLikes());
};

// Handling recipe button clicks

elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Decrease button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    ctrlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    ctrlLike();
  }
});

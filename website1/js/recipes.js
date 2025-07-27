// Recipes Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const recipeForm = document.getElementById('recipeForm');
    const recipesContainer = document.getElementById('recipesContainer');
    const rewardPointsElement = document.getElementById('rewardPoints');
    const recipeSearch = document.getElementById('recipeSearch');
    const recipeFilter = document.getElementById('recipeFilter');
    
    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let rewardPoints = parseInt(localStorage.getItem('rewardPoints')) || 0;
    
    // Initialize reward points display
    rewardPointsElement.textContent = rewardPoints;
    
    // Load recipes
    renderRecipes();
    
    // Form submission
    recipeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('recipeTitle').value;
        const description = document.getElementById('recipeDescription').value;
        const imageInput = document.getElementById('recipeImage');
        
        // Create a recipe object
        const newRecipe = {
            id: Date.now(),
            title,
            description,
            likes: 0,
            date: new Date().toISOString(),
            image: ''
        };
        
        // Handle image upload
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                newRecipe.image = e.target.result;
                saveRecipe(newRecipe);
            };
            
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            saveRecipe(newRecipe);
        }
    });
    
    function saveRecipe(recipe) {
        recipes.unshift(recipe); // Add to beginning of array
        localStorage.setItem('recipes', JSON.stringify(recipes));
        
        // Reset form
        recipeForm.reset();
        
        // Show success message
        showNotification('Recipe uploaded successfully!');
        
        // Re-render recipes
        renderRecipes();
    }
    
    function renderRecipes(filteredRecipes = null) {
        const recipesToRender = filteredRecipes || recipes;
        
        if (recipesToRender.length === 0) {
            recipesContainer.innerHTML = `
                <div class="placeholder-recipe">
                    <p>No recipes yet. Be the first to share!</p>
                </div>
            `;
            return;
        }
        
        recipesContainer.innerHTML = recipesToRender.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">` : ''}
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-footer">
                        <button class="like-btn ${isRecipeLiked(recipe.id) ? 'liked' : ''}" data-id="${recipe.id}">
                            <span class="heart-icon">❤️</span>
                            <span class="like-count">${recipe.likes}</span> likes
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to like buttons
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const recipeId = parseInt(this.getAttribute('data-id'));
                likeRecipe(recipeId);
            });
        });
    }
    
    function isRecipeLiked(recipeId) {
        const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
        return likedRecipes.includes(recipeId);
    }
    
    function likeRecipe(recipeId) {
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        if (recipeIndex === -1) return;
        
        const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];
        const alreadyLiked = likedRecipes.includes(recipeId);
        
        if (alreadyLiked) {
            // Unlike
            recipes[recipeIndex].likes--;
            const newLikedRecipes = likedRecipes.filter(id => id !== recipeId);
            localStorage.setItem('likedRecipes', JSON.stringify(newLikedRecipes));
        } else {
            // Like
            recipes[recipeIndex].likes++;
            likedRecipes.push(recipeId);
            localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
            
            // Add reward points
            rewardPoints += 5;
            localStorage.setItem('rewardPoints', rewardPoints);
            rewardPointsElement.textContent = rewardPoints;
            
            // Pulse animation
            const likeBtn = document.querySelector(`.like-btn[data-id="${recipeId}"]`);
            likeBtn.classList.add('liked');
            likeBtn.querySelector('.heart-icon').classList.add('pulse');
            
            setTimeout(() => {
                likeBtn.querySelector('.heart-icon').classList.remove('pulse');
            }, 500);
        }
        
        localStorage.setItem('recipes', JSON.stringify(recipes));
        renderRecipes();
    }
    
    // Search functionality
    recipeSearch.addEventListener('input', function() {
        filterRecipes();
    });
    
    // Filter functionality
    recipeFilter.addEventListener('change', function() {
        filterRecipes();
    });
    
    function filterRecipes() {
        const searchTerm = recipeSearch.value.toLowerCase();
        const filterValue = recipeFilter.value;
        
        let filtered = recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm) || 
            recipe.description.toLowerCase().includes(searchTerm)
        );
        
        if (filterValue === 'popular') {
            filtered.sort((a, b) => b.likes - a.likes);
        } else if (filterValue === 'recent') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        renderRecipes(filtered);
    }
});
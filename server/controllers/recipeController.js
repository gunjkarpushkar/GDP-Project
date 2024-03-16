require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const port = process.env.port

exports.homepage = async(req, res) => {
  try {
    const limitNumber = 6;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);

    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Cooking Blog - Home', categories, food } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
}


exports.exploreCategories = async(req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categories', categories } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 

exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 4;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
}  
 

exports.exploreRecipe = async(req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



exports.searchRecipe = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
  
}


exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 4;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 




exports.exploreRandom = async(req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



exports.submitRecipe = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj  } );
}


exports.submitRecipeOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName
    });
    
    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}




 
 async function deleteRecipe(){
   try {
     await Recipe.deleteOne({ name: 'New Recipe From Form' });
   } catch (error) {
     console.log(error);
   }
 }
 deleteRecipe();

 
 async function updateRecipe(){
   try {
     const res = await Recipe.updateOne({ name: 'New Recipe' }, { name: 'New Recipe Updated' });
     res.n; 
     res.nModified; 
   } catch (error) {
     console.log(error);
   }
 }
 updateRecipe();

 async function insertDymmyCategoryData(){
   try {
     await Category.insertMany([
       {
         "name": "Thai",
         "image": "thai-food.jpg"
       },
       {
         "name": "American",
         "image": "american-food.jpg"
       }, 
       {
         "name": "Chinese",
         "image": "chinese-food.jpg"
       },
       {
         "name": "Mexican",
         "image": "mexican-food.jpg"
       }, 
       {
         "name": "Indian",
         "image": "indian-food.jpg"
       },
       {
         "name": "Spanish",
         "image": "spanish-food.jpg"
       }
     ]);
   } catch (error) {
     console.log('err', + error)
   }
  }
 
 insertDymmyCategoryData();

 async function insertDymmyRecipeData(){
   try {
     await Recipe.insertMany([
       { 
         "name": " Bamboo chicken ",
         "description": `crispy`,
         "email": "22@gmail.com",
         "ingredients": [
           "1 level teaspoon baking powder",
           "1 level teaspoon cayenne pepper",
           "1 level teaspoon hot smoked paprika",
         ], 
         "category": "American", 
         "image": "key-lime-pie.jpg"
       },
       { 
         "name": "Pad See Ew",
         "description": `Mix Sauce in small bowl.
         Mince garlic into wok with oil.
         Place over high heat, when hot, add chicken and Chinese broccoli stems, cook until chicken is light golden.
         Push to the side of the wok, crack egg in and scramble.
         Don't worry if it sticks to the bottom of the wok - it will char and which adds authentic flavour.
         Add noodles, Chinese broccoli leaves and sauce.
         Gently mix together until the noodles are stained dark and leaves are wilted.
         Serve immediately!`,
         "email": "viks@gmail.com",
         "ingredients": [
           "Rice Stick Noodles",
           "White Vinegar",
           "Oyster Sauce",
         ],
         "category": "Thai", 
         "image": "A5.jpg"
       },
       { 
        "name": "Feteer Meshaltet",
        "description": `Mix the flour and salt then pour one cup of water and start kneading.
        If you feel the dough is still not coming together or too dry, gradually add the remaining water until you get a dough that is very elastic so that when you pull it and it won’t be torn.
        Let the dough rest for just 10 minutes then divide the dough into 6-8 balls depending on the size you want for your feteer.
        Warm up the butter/ghee or oil you are using and pour into a deep bowl.
        Immerse the dough balls into the warm butter.
        Let it rest for 15 to 20 minutes.
        Preheat oven to 550F.
        Stretch the first ball with your hands on a clean countertop.
        Stretch it as thin as you can, the goal here is to see your countertop through the dough.
        Fold the dough over itself to form a square brushing in between folds with the butter mixture.
        Set aside and start making the next ball.
        Stretch the second one thin as we have done for the first ball.
        Place the previous one on the middle seam side down.
        Fold the outer one over brushing with more butter mixture as you fold.
        Set aside.
        Keep doing this for the third and fourth balls.
        Now we have one ready, place on a 10 inch baking/pie dish seam side down and brush the top with more butter.
        Repeat for the remaining 4 balls to make a second one.
        With your hands lightly press the folded feteer to spread it on the baking dish.
        Place in preheated oven for 10 minutes when the feteer starts puffing turn on the broiler to brown the top.
        When it is done add little butter on top and cover so it won’t get dry.`,
        "email": "viks@gmail.com",
        "ingredients": [
          "Flour",
          "Salt",
          "Unsalted Butter",
          "Olive Oil",
        ],
        "category": "Mexican", 
        "image": "A22.jpg"
      },
      { 
        "name": " Chicken Congee",
        "description": `STEP 1 - MARINATING THE CHICKEN In a bowl, add chicken, salt, white pepper, ginger juice and then mix it together well.
        Set the chicken aside.
        STEP 2 - RINSE THE WHITE RICE Rinse the rice in a metal bowl or pot a couple times and then drain the water.
        STEP 2 - BOILING THE WHITE RICE Next add 8 cups of water and then set the stove on high heat until it is boiling.
        Once rice porridge starts to boil, set the stove on low heat and then stir it once every 8-10 minutes for around 20-25 minutes.
        After 25 minutes, this is optional but you can add a little bit more water to make rice porridge to make it less thick or to your preference.
        Next add the marinated chicken to the rice porridge and leave the stove on low heat for another 10 minutes.
        After an additional 10 minutes add the green onions, sliced ginger, 1 pinch of salt, 1 pinch of white pepper and stir for 10 seconds.
        Serve the rice porridge in a bowl Optional: add Coriander on top of the rice porridge.`,
        "email": "co@gmail.com",
        "ingredients": [
          "Chicken",
          "Salt",
          "Ginger Cordial",
          "Rice"
        ],
        "category": "Chinese", 
        "image": "A23.jpg"
      },
      { 
        "name": "Honey Teriyaki Salmon",
        "description": `Mix all the ingredients in the Honey Teriyaki Glaze together.
        Whisk to blend well.
        Combine the salmon and the Glaze together.
        Heat up a skillet on medium-low heat.
        Add the oil, Pan-fry the salmon on both sides until it’s completely cooked inside and the glaze thickens.
        Garnish with sesame and serve immediately.`,
        "email": "vo@gmail.com",
        "ingredients": [
          "Salmon",
          "Olive Oil",
          "Sesame Seed",
          "Sake"
        ],
        "category": "Thai", 
        "image": "Honey Teriyaki Salmon.jpg"
      },
      { 
        "name": "Tonkatsu pork",
        "description": `STEP 1 Remove the large piece of fat on the edge of each pork loin, then bash each of the loins between two pieces of baking parchment until around 1cm in thickness – you can do this using a meat tenderiser or a rolling pin.
        Once bashed, use your hands to reshape the meat to its original shape and thickness – this step will ensure the meat is as succulent as possible.
        STEP 2 Put the flour, eggs and panko breadcrumbs into three separate wide-rimmed bowls.
        Season the meat, then dip first in the flour, followed by the eggs, then the breadcrumbs.
        STEP 3 In a large frying or sauté pan, add enough oil to come 2cm up the side of the pan.
        Heat the oil to 180C – if you don’t have a thermometer, drop a bit of panko into the oil and if it sinks a little then starts to fry, the oil is ready.
        Add two pork chops and cook for 1 min 30 secs on each side, then remove and leave to rest on a wire rack for 5 mins.
        Repeat with the remaining pork chops.
        STEP 4 While the pork is resting, make the sauce by whisking the ingredients together, adding a splash of water if it’s particularly thick.
        Slice the tonkatsu and serve drizzled with the sauce.`,
        "email": "po@gmail.com",
        "ingredients": [
          "Pork Chops",
          "Breadcrumbs",
          "Worcestershire Sauce",
          "Caster Sugar",
          "Oyster Sauce"
        ],
        "category": "American", 
        "image": "Tonkastsu pork.jpg"
      },
      
     ]);
   } catch (error) {
     console.log('err', + error)
   }
  }
 
 insertDymmyRecipeData();
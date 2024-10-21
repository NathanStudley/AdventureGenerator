//elements
const generateButtonElement = document.getElementById('generateButton');

const addNameElement = document.getElementById('activityName');
const addCategoryElement = document.getElementById('category');
const addLocationElement = document.getElementById('location');
const addWeathDepElement = document.getElementById('weatherdependent');
const addActivityButton = document.getElementById('addActivity');
const addConfirmation = document.getElementById('confirmation');

const topActivitiesElement = document.getElementById('topActivities');


const randCategorySelectElement = document.getElementById('rcategories');
const randLocationElement = document.getElementById('rlocations');
const randWeathDepElement = document.getElementById('rweatherdependent');
const randActivitiesElement = document.getElementById('randomActivities');
const howManyElement = document.getElementById('howMany');

//local storage for saving settings
if ( window.localStorage.getItem('category') !== null){
    addCategoryElement.value = JSON.parse(window.localStorage.getItem('category')).category;
}
function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}
localStorage.clear();

const renderCategories = async() => {
    const categories = await getCategories();
    removeOptions(randCategorySelectElement);
    const option = document.createElement('option');
    option.value = '';
    option.text = 'Any';
    randCategorySelectElement.add(option);
    categories.forEach((cat) =>{
        const option = document.createElement('option');
        option.value = cat;
        option.text = cat;
        randCategorySelectElement.add(option);
    });
}


const renderLocations = async() => {
    const locations = await getLocations();
    removeOptions(randLocationElement);
    const option = document.createElement('option');
    option.value = '';
    option.text = 'Any';
    randLocationElement.add(option);
    locations.forEach((loc) =>{
        const option = document.createElement('option');
        option.value = loc;
        option.text = loc;
        randLocationElement.add(option);
    });

}


const renderActivities = async(element, activities) => {
    element.innerHTML = '';
    activities.forEach(act => {

        const div = document.createElement('div');
        div.classList.add('activity-item');
        const actName = act.name;
        let location = '';
        if(act.location === ""){
            location = 'Anywhere!';
        } else{
            location = act.location;
        }
        
        const timesCompleted = document.createElement('div');
        timesCompleted.innerHTML = 'Times Completed: ' + act.count;

        const deleteButton = document.createElement('input');
        deleteButton.type = 'button';
        deleteButton.value = 'Delete'
        deleteButton.addEventListener('click', async() =>{
            await deleteActivity(act._id);
            div.innerHTML='';
            await renderTopActivities();
            await renderCategories();
            await renderLocations();
            randActivitiesElement.innerHTML ='';
        });

        const tallyButton = document.createElement('input');
        tallyButton.type = 'button';
        tallyButton.value = 'Update Tally!';
        tallyButton.addEventListener('click', async() => {
            await updateActivity(act._id);
            act.count++;
            timesCompleted.innerText = 'Times Completed: ' + act.count;
            await renderTopActivities();
        
        });

        const resetButton = document.createElement('input');
        resetButton.type = 'button';
        resetButton.value = 'Reset Tally';
        resetButton.addEventListener('click', async() => {
            await resetActivity(act._id);
            act.count = 0;
            timesCompleted.innerText = 'Times Completed: 0';
            await renderTopActivities();
        })

        

        div.innerHTML= 'Activity: ' + actName + '<br />' + ' Location: ' + location + '<br />';
        div.appendChild(timesCompleted);
        div.appendChild(tallyButton);
        div.appendChild(resetButton);
        div.appendChild(deleteButton);
        element.appendChild(div);
    });
}


const generateRandArr = async() => {
    let newParameters = {};
    if(randCategorySelectElement.value !== ""){
        newParameters.category = randCategorySelectElement.value;
    }
    newParameters.location = randLocationElement.value;
    if(randWeathDepElement.checked){
        newParameters.weatherdependant = true;
    }

    const numActs = howManyElement.value;
    let actArr = [];

    if(await enough(newParameters, numActs)){
        actArr = await randomActivities(newParameters, numActs);
        console.log(actArr)

    }
    else{
        alert('There is not enough activities to satisfy your filters. Add new activities or change filters.');
    }
    return actArr;

}

const renderTopActivities = async() => {
    const topActs = await activitiesRanked();
    await renderActivities(topActivitiesElement, topActs);
    renderTopActivities
}
await renderTopActivities();
await renderCategories();
await renderLocations();

//button event listeners
generateButtonElement.addEventListener('click', async() => {

    const activities = await generateRandArr();
    if(activities.length > 0){
        await renderActivities(randActivitiesElement, activities);
    }
});

addActivityButton.addEventListener('click', async() =>{
    if(addNameElement.value === '' || addCategoryElement === ''){
        alert('Necessary parameters are missing to add activity! (check name/category)');
    }
    else{
        let location = '';
        if(addLocationElement.value !== ""){
            location = addLocationElement.value;
        }
        await createActivity(addNameElement.value, addCategoryElement.value, addWeathDepElement.checked, location);
        addConfirmation.innerText = 'Activity added!';
        addNameElement.value = '';
        await renderCategories();
        await renderLocations();

        const cat = {category: addCategoryElement.value};
        window.localStorage.setItem('category', JSON.stringify(cat));

    }
});



//CRUD operations
async function createActivity(name, category, weatherdependant, location){
    const newActivity = {name: name, category: category, weatherdependant: weatherdependant, location: location};
    const localURL = 'http://localhost:3000/createActivity';

    try {
        const response = await fetch(localURL,{
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(newActivity),
        });
    } catch{
        
    }

}
async function updateActivity(_id){
    const localURL = 'http://localhost:3000/updateActivity';
    const id = {_id: _id};
    try {
        const response = await fetch(localURL, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(id),
        });
    } catch{
        
    }
}

async function resetActivity(_id){
    const localURL = 'http://localhost:3000/resetActivity';
    const id = {_id: _id};
    try {
        const response = await fetch(localURL, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(id),
        });
    } catch{

    }
}

async function findActivities(parameters){
    const localURL = 'http://localhost:3000/findActivities';

    try {
        const response = await fetch(localURL, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(parameters),
        });
        return await response.json();
    } catch{
        
    }
}

async function deleteActivity(_id){
    const localURL = 'http://localhost:3000/deleteActivity';
    const id = {_id: _id};
    try {
        const response = await fetch(localURL, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(id),
        });
    } catch{
        
    }
}

async function randomActivities(parameters, number){
    const localURL = 'http://localhost:3000/randomActivities';
    const params = { parameters: parameters, number: number };
    try {
        const response = await fetch(localURL, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(params),
        });

        return await response.json();
    } catch{

    }

}

async function activitiesRanked(){
    const localURL = 'http://localhost:3000/activitiesRanked';

    try {
        const response = await fetch(localURL, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
        });
        return await response.json();
    } catch{
        
    }
}


async function enough(parameters, number){
    const params = {parameters: parameters, number: number};
    const localURL = 'http://localhost:3000/enough';

    try {
        const response = await fetch(localURL, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(params),
        });
      
        return await response.json();
    } catch{

        
    }
}

async function getCategories(){
    const localURL = 'http://localhost:3000/distinctCategories';

    try {
        const response = await fetch(localURL, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
        });
        return await response.json();
    } catch{
        
    }
}

async function getLocations(){
    const localURL = 'http://localhost:3000/distinctLocations';

    try {
        const response = await fetch(localURL, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
        });
        return await response.json();
    } catch{
        
    }
}
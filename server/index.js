//import database
import { database } from "./database.js";

//Create express app.
import express from 'express';
import logger from 'morgan';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use('/', express.static('client'));


//Implement endpoints.

app.post('/createActivity', async(req, res) => {
    const {name, category, weatherdependent, location} = req.body;
    await database.connect();
    await database.createActivity(name, category, weatherdependent, location);
    await database.close();
    res.status(200).json({"status": "success"});
});

app.get('/findActivities', async(req, res) => {
    const parameters = req.body;
    await database.connect();
    res.status(200).json(await database.readActivities(parameters));
    await database.close();
});

app.get('/activitiesRanked', async(req, res) => {
    await database.connect();
    res.status(200).json(await database.topActivities());
    await database.close();
});

app.put('/randomActivities', async(req, res) =>{
    const { parameters, number } = req.body;
    await database.connect();
    res.status(200).json(await database.randomActivities(parameters, number));
    await database.close();
});

app.delete('/deleteActivity', async(req, res) => {
    const _id = req.body;
    await database.connect();
    await database.deleteActivity(_id);
    await database.close();
    res.status(200).json({"status": "success"});
});

app.put('/updateActivity', async(req, res) => {
    const _id = req.body;
    await database.connect();
    await database.updateActivityCount(_id);
    await database.close();
    res.status(200).json({"status": "success"});
});

app.put('/resetActivity', async(req, res)=> {
    const _id = req.body;
    await database.connect();
    await database.resetActivity(_id);
    await database.close();
    res.status(200).json({"status": "success"});
});

app.put('/enough', async(req, res)=> {
    const {parameters, number} = req.body;
    await database.connect();
    res.status(200).json(await database.enoughActivities(parameters, number));
    await database.close();
});

app.get('/distinctCategories', async(req, res) => {
    await database.connect();
    res.status(200).json(await database.getDistinctCategories());
    await database.close();
});

app.get('/distinctLocations', async(req, res) => {
    await database.connect();
    res.status(200).json(await database.getDistinctLocations());
    await database.close();
});











// This matches all routes that are not defined.
app.all('*', async (request, response) => {
    response.status(404).send(`Not found: ${request.path}`);
});

// Start sever.
app.listen(port, () => {

  const msg = `Server started on http://localhost:${port}`;
  console.log(msg);

});
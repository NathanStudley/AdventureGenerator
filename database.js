
import {MongoClient, ObjectId} from 'mongodb';

class Database {
    constructor(){
        this.dburl = 'mongodb+srv://nathanstudley:thePassword@cluster0.6bhmhy0.mongodb.net/?retryWrites=true&w=majority';
    }

    async connect() {
        this.client = await MongoClient.connect(this.dburl);
        this.db = this.client.db('projectdatabase');


        await this.init();
    }

    async init() {
        this.activities = this.db.collection('activities');
        
        const count = await this.activities.countDocuments(); 

        if(count === 0){
            this.activities.insertMany([
                {name: 'Beach!', category: 'fun', weatherdependant: true, location: '', count: 0 },
                {name: 'Mini Golf', category: 'fun', weatherdependant: true, location:'', count: 0 },
                {name: 'Fly a Kite', category: 'fun', weatherdependant: true, location:'', count: 0},
                {name: 'Board Game', category: 'fun', weatherdependant: false, location:'', count: 0 },
                {name: 'Movies', category: 'fun', weatherdependant: false, location:'', count: 0 },
                {name: 'Museum', category: 'educational', weatherdependant: false, location:'', count: 0}, 
                {name: 'Pizza', category: 'food', weatherdependant: false, location:'', count: 0}, 
                {name: 'Sushi', category: 'food', weatherdependant: false, location:'', count: 0}, 
                {name: 'Tacos', category: 'food', weatherdependant: false, location:'', count: 0},  
                {name: 'UMass', category: 'educational', weatherdependant: false, location:'Amherst', count: 0},  
            ]);
        }
        
    }

    async close(){
        this.client.close();
    }

    //Basic CRUD Operations
    async createActivity(name, category, weatherdependent, location){

        await this.activities.insertOne({name: name, category: category, weatherdependent: weatherdependent, location: location, count: 0});

    }

    async updateActivityCount(id){
        const _id = id._id;
        const o_id = new ObjectId(_id);
        await this.activities.updateOne({"_id": o_id}, {$inc: {"count": 1}});
    }

    async deleteActivity(id){
        const _id = id._id;
        const o_id = new ObjectId(_id);
        await this.activities.deleteOne({"_id": o_id});
    }

    async readActivities(parameters){
        const activities = await this.activities.find(parameters).toArray();
        return activities;
    } 


    //Find random activity given parameters.
    async randomActivity(parameters){
        const activityArr = await this.activities.find(parameters).toArray();
        const randActivity = activityArr[Math.floor(Math.random() * activityArr.length)]
        return randActivity;
    }

    //Get all activities ordered by times done.
    async topActivities(){
        const rankedActivities = await this.activities.find({"count": {$gte: 1}}).sort({count: -1}).limit(10).toArray();
        return rankedActivities;
    }

    async enoughActivities(parameters, number){
        if((await this.activities.find(parameters).toArray()).length >= number){
            return true;
        }
        else{
            return false;
        }
    }

    async getDistinctCategories(){
        return await this.activities.distinct("category");
    }

    async getDistinctLocations(){
        return await this.activities.distinct("location");
    }
}

const database = new Database();

export { database };
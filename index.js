const express = require('express'); 
 const app = express(); 
 const bodyParser = require('body-parser'); 
 const { MongoClient } = require('mongodb'); 
  
 app.use(bodyParser.urlencoded({ extended: true })); 
  
 const url = 'mongodb://127.0.0.1:27017'; 
 const dbName = 'Library'; 
  
 app.get('/', (req, res) => { 
   res.sendFile(__dirname + '/public/index.html'); 
 }); 
  
 app.get('/search', async (req, res) => { 
   const searchType = req.query.search_type; 
   const name = req.query.book_name; 
   const publicationDate = req.query.publication_date; 
   console.log("searchType=" + searchType); 
   console.log("bookName=" + name); 
   console.log("publicationDate=" + publicationDate); 
   try { 
     const client = new MongoClient(url); 
     await client.connect(); 
     console.log('Connected successfully to server'); 
     const db = client.db(dbName); 
     const collection = db.collection('Books'); 
    
  
     console.log("Entered try"); 
     if (searchType === 'book') { 
       console.log("Entered book"); 
  
       const regex = new RegExp(`^${name}`, 'i'); 
       const query = { 
         Name: { $regex: regex }, 
         publicationDate: { $gte: publicationDate } 
       }; 
       const findResult = await collection.find(query).toArray(); 
       console.log('Found documents =>', findResult); 
       if(findResult==0){ 
         res.send("No result") 
       } 
       else{ 
       res.send(formatSearchResults(findResult, searchType)); 
       } 
     } else if (searchType === 'journal') { 
       console.log("Entered journal"); 
       const regex = new RegExp(`^${name}`, 'i'); 
       
       console.log("regex="+regex);
       const journalCollection = db.collection('Journals'); 
       const query = { 
         Name: { $regex: regex }, 
         //publicationDate: { $gte: publicationDate } 
       }; 
       console.log(query);
       const findResult = await journalCollection.find(query).toArray(); 
       console.log('Found documents =>', findResult); 
       if(findResult==0){ 
         res.send("No result") 
       } 
       else{ 
       res.send(formatSearchResults(findResult, searchType)); 
       } 
     } else { 
       return res.status(400).send('Invalid search type'); 
     } 
   } catch (err) { 
     console.error(err); 
     res.status(500).send('Error retrieving data'); 
   } 
 }); 

 
  
 app.post('/update', async (req, res) => { 
   const updateType = req.body.update_type; 
   const id = req.body.update_id; 
   const newName = req.body.new_name; 
   console.log("UpdateType=" + updateType); 
   console.log("Id is " + id); 
   console.log("newName is " + newName); 
   try { 
     const client = new MongoClient(url); 
     await client.connect(); 
     console.log('Connected successfully to server'); 
     const db = client.db(dbName); 
  
     if (updateType === 'book') { 
       console.log("Entered book"); 
       const collection = db.collection('Books'); 
       const filter = { bookId: id };
       console.log(await collection.findOne(filter)); 
       const update = { $set: { Name: newName } }; 
       const result = await collection.updateOne(filter, update); 
       console.log('Modified count:', result.modifiedCount); 
       res.send(`Updated book ID: ${id} with new name: ${newName}`); 
     } else if (updateType === 'journal') { 
      console.log("Entered journal");
       const collection = db.collection('Journals'); 
       const filter = { journalId: id }; 
       console.log(await collection.findOne(filter));
       const update = { $set: { Name: newName } }; 
       const result = await collection.updateOne(filter, update); 
       console.log('Modified count:', result.modifiedCount); 
       res.send(`Updated journal ID: ${id} with new name: ${newName}`); 
     } else { 
       return res.status(400).send('Invalid update type'); 
     } 
   } catch (err) { 
     console.error(err); 
     res.status(500).send('Error updating data'); 
   } 
 }); 
  
 function formatSearchResults(findResult, searchType) { 
   let html = '<h1>Library Management System</h1>'; 
   html += `<h2>Search Results for ${searchType}</h2>`; 
   html += '<ul>'; 
   console.log("items=" + findResult); 
   findResult.forEach((item) => { 
     console.log("findResult.Name=" + item.Name); 
     html += `<li>${item.Name} - Publication Date: ${item.publicationDate}</li>`; 
   }); 
  
   html += '</ul>'; 
  
   return html; 
 } 
  
 app.get('/report', async (req, res) => { 
   const reportType = req.query.report_type; 
   const startDate = req.query.start_date; 
   const endDate = req.query.end_date; 
   console.log("reportType=" + reportType); 
   console.log("startDate=" + startDate); 
   console.log("endDate=" + endDate); 
   try { 
     const client = new MongoClient(url); 
     await client.connect(); 
     console.log('Connected successfully to server'); 
     const db = client.db(dbName); 
  
     if (reportType === 'book') { 
       console.log("Entered book"); 
       const collection = db.collection('Books'); 
  
       // Construct the query to filter books within the date range 
       const start = new Date(startDate); 
       const end = new Date(endDate); 
      console.log(start);
      console.log(end);
       const query = { 
        publicationDate: { $gte: startDate } 
         //publicationDate: { 
          
          // $gte: start.toISOString().split('T')[0], 
           //$lte: end.toISOString().split('T')[0] 
         //} 
       }; 
  
       const findResult = await collection.find(query).toArray(); 
       console.log('Found documents =>', findResult); 
       res.send(formatReportResults(findResult, reportType)); 
     } else if (reportType === 'journal') { 
       const collection = db.collection('Journals'); 
  
       // Construct the query to filter journals within the date range 
       const start = new Date(startDate); 
       const end = new Date(endDate); 
  
       const query = { 
         publicationDate: { 
           $gte: start.toISOString().split('T')[0], 
           $lte: end.toISOString().split('T')[0] 
         } 
       }; 
  
       const findResult = await collection.find(query).toArray(); 
       console.log('Found documents =>', findResult); 
       if(findResult==0){ 
         res.send("No result") 
       } 
       else{ 
       res.send(formatReportResults(findResult, reportType)); 
       } 
     } else { 
       return res.status(400).send('Invalid report type'); 
     } 
   } catch (err) { 
     console.error(err); 
     res.status(500).send('Error generating report'); 
   } 
 }); 
  
 function formatReportResults(findResult, reportType) { 
   let html = '<h1>Library Management System</h1>'; 
   html += `<h2>Report Results for ${reportType}</h2>`; 
   html += '<ul>'; 
  
   findResult.forEach((item) => { 
     html += `<li>${item.Name} - Publication Date: ${item.publicationDate} - Author: ${item.author}</li>`; 
   }); 
  
   html += '</ul>'; 
  
   return html; 
 } 

 const server = app.listen(3000, () => {
  const port = server.address().port;
  console.log(`Server started on port ${port}`);
});
  

import express, {  Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isValidImageURL} from './util/util';
import { request } from 'http';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  

  // Endpoint to filter an image from a public url.
  app.get("/filteredimage", async ( request: Request, response: Response ) => {
    const image_url:string = request.query.image_url;
    // validate image URL
    if (!isValidImageURL(image_url)) {
      return response.status(400).send({message: 'Invalid image URL. Please give the properly image URL.'})
    }

    const filteredpath = await filterImageFromURL(image_url);

    // send the resulting file in the response
    // also deletes any files on the server after all
    response.sendFile(filteredpath, () => {
      deleteLocalFiles([filteredpath]);
    } )
  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();

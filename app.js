const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_Actor,
  };
};

const convertDirectorObjectToResponseObject = (dbDirector) => {
  return {
    directorId: dbDirector.director_id,
    directorName: dbDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name FROM movie 
    ;
    
    `;
  const movieNames = await database.all(getMovieQuery);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//movies Post
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  // const {movieId}=request.params;
  const postMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');
    
    
    `;
  const movieUpdate = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//get Movies

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
       SELECT * FROM movie WHERE movie_id=${movieId};
       
       `;
  const movieDetails = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieDetails));
});
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
   director_id= ${directorId},
   movie_name= '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
   movie_id = ${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE 
    movie_id=${movieId};
    
    `;
  await database.run(deleteQuery);
  response.send("Movie Removed");
});

//DIRECTOR API

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director 
    ;
    
    `;
  const directorDetails = await database.all(getDirectorQuery);
  response.send(
    directorDetails.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

//Get Director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT
    *
    FROM
        movie
    WHERE
        director_id = ${directorId};`;
  const movieArray = await database.all(getDirectorMovieQuery);
  response.send(movieArray);
});

module.exports = app;

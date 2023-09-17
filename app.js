const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//converting MovieDB Object to MovieResponse Object

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//Converting DirectorDb Object to DirectorResponse Object

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// Get Movies API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
      movie_name 
    FROM 
      movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Add Movie API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
      movie (director_id,movie_name,lead_actor)
    VALUES 
      (${directorId},'${movieName}','${leadActor}');`;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const GetMovieQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(GetMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//Update Movie API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = ${movieId};`;
  const updateMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
      DELETE FROM movie 
      WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
      SELECT * FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//Get Director Movies API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
     SELECT movie_name FROM movie 
     WHERE director_id = ${directorId};`;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;

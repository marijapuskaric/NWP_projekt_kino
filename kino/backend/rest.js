const express = require('express');
const mongoose = require('mongoose');
const db = require('./db')
const UserModel = require('./Models/userModel');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const ProjectionModel = require('./Models/projectionModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userProjectionReservationModel = require('./Models/userProjectionReservationModel');
const userProjectionLikedModel = require('./Models/userProjectionLikedModel');
const projectionModel = require('./Models/projectionModel');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) 
{
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//authentication

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const userModel = new UserModel({
                username: req.body.username,
                password: hash,
                role: "user"
            });

            userModel.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created',
                        result: result
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                });
        });
});

app.post('/login', (req, res) => {
    let userFound;
    UserModel.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            userFound = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({ message: 'Password is incorrect' });
            }
            const token = jwt.sign({ username: userFound.username, userId: userFound._id }, "secret_string", { expiresIn: "1h" });
            return res.status(200).json({
                token: token,
                expiresIn: 3600
            });
        })
        .catch(err => {
            return res.status(401).json({ message: 'Error with authentication' });
        });
});

app.get("/user", (req, res) => {
    const token = req.headers.authorization;
    jwt.verify(token, 'secret_string', (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        } else {
            const userId = decodedToken.userId;

            UserModel.findById(userId)
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    return res.status(200).json({ user: user });
                })
                .catch(error => {
                    console.error(error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                });
        }
    });
});

app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find({});
        return res.status(200).json({ users: users });
    }
    catch (err) 
    {
        console.error(err); 
        res.status(500).send("Error getting users"); 
    }
});

//projection

app.post("/createProjection", upload.single('image'), (req, res) => {

    if (!req.file) 
    {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const showTime = new Date(req.body.showTime);
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    fs.readFile(filePath, (err, data) => {
        if (err) 
        {
            console.error('File reading error:', err);
            return res.status(500).json({ error: err });
        }

        const projectionModel = new ProjectionModel({
            title: req.body.title,
            description: req.body.description,
            runningTime: req.body.runningTime,
            img: {
                data: data,
                contentType: req.file.mimetype
            },
            availableSeats: req.body.availableSeats || 100,
            takenSeats: 0,
            showTime: showTime.toISOString(),
            createdBy: req.body.createdBy
        });

        projectionModel.save()
            .then(async (result) => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting the file:', err);
                    }
                });

                const savedProjection = await ProjectionModel.findById(result._id).lean();
                console.log('Saved Projection:', savedProjection);

                res.status(201).json({
                    message: 'Projection created',
                    result: savedProjection
                });
            })
            .catch(err => {
                res.status(500).json({ error: err });
            });
    });
});

app.post('/deleteProjection/:projectionId', upload.single('image'), async (req, res) => {
    var projectionId = req.params.projectionId;
  
    try 
    {
      await projectionModel.findOneAndDelete({ _id: projectionId });
      await userProjectionLikedModel.deleteMany({ projectionId: projectionId });
      await userProjectionReservationModel.deleteMany({ projectionId: projectionId });
  
      console.log("Deleted projection and related entries");
      res.status(200).json({ message: "Projection deleted successfully" }); 
    } 
    catch (err) 
    {
      console.error(err);
      res.status(500).json({ error: "Error deleting projection and related entries" }); 
    }
  });

  app.post('/editProjection/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    const { title, description, runningTime, availableSeats, takenSeats, showTime, createdBy } = req.body;
  
    try 
    {
      const projection = await ProjectionModel.findById(id);
      if (!projection) 
      {
        return res.status(404).send("Projection not found");
      }

      projection.title = title;
      projection.description = description;
      projection.runningTime = runningTime;
      projection.availableSeats = availableSeats;
      projection.takenSeats = takenSeats;
      projection.showTime = showTime;
      projection.createdBy = createdBy;
  
      if (req.file) 
      {
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error('File reading error:', err);
            return res.status(500).json({ error: 'Error reading file' });
          }
          projection.img = {
            data: data,
            contentType: req.file.mimetype
          };
          projection.save()
            .then(() => {
              console.log('Projection updated successfully');
              res.status(200).json({ message: 'Projection updated' });
            })
            .catch(error => {
              console.error('Error saving projection:', error);
              res.status(500).json({ error: 'Error saving projection' });
            });
        });
      } 
      else 
      {
        await projection.save();
        console.log('Projection updated successfully without image');
        res.status(200).json({ message: 'Projection updated' });
      }
    } 
    catch (err) 
    {
      console.error('Error updating projection:', err);
      res.status(500).json({ error: 'Error updating projection data' });
    }
  });

app.get("/futureProjections", async (req, res) => {
    const currentTime = new Date();
    try 
    {
        const projections = await ProjectionModel.find({ showTime: { $gt: currentTime } });

        const projectionsWithBase64 = projections.map(proj => {
            return {
                ...proj.toObject(),
                img: {
                    data: proj.img.data.toString('base64'),
                    contentType: proj.img.contentType
                }
            };
        });

        res.json({ projections: projectionsWithBase64 });
    } 
    catch (err) 
    {
        console.error('Error fetching projections:', err);
        res.status(500).json({ error: 'Error fetching projections' });
    }
});

app.get("/pastProjections", async (req, res) => {
    const currentTime = new Date();
    try 
    {
        const projections = await ProjectionModel.find({ showTime: { $lt: currentTime } });

        const projectionsWithBase64 = projections.map(proj => {
            return {
                ...proj.toObject(),
                img: {
                    data: proj.img.data.toString('base64'),
                    contentType: proj.img.contentType
                }
            };
        });

        res.json({ projections: projectionsWithBase64 });
    } 
    catch (err) 
    {
        console.error('Error fetching projections:', err);
        res.status(500).json({ error: 'Error fetching projections' });
    }
});

app.get("/projection/:id", async (req, res) => {
    const projectionId = req.params.id;
    try 
    {
        const projection = await ProjectionModel.findById(projectionId);

        if (!projection) 
        {
            return res.status(404).json({ error: 'Projection not found' });
        }

        const projectionWithBase64 = projection.toObject();

        if (projectionWithBase64.img && projectionWithBase64.img.data) 
        {
            projectionWithBase64.img.data = projectionWithBase64.img.data.toString('base64');
        }

        res.json({ projection: projectionWithBase64 });
    } 
    catch (err) 
    {
        console.error('Error fetching projection:', err);
        res.status(500).json({ error: 'Error fetching projection' });
    }
});

//reservation
app.post("/makeReservation/:projectionId", async (req, res) => {
    var projectionId = req.params.projectionId;
    var userId = req.body.madeBy;
    var numberOfSeats = req.body.numOfSeats;
    console.log("Projection id:", projectionId);
    console.log("User id:", userId);
    console.log("seats:", numberOfSeats);

    try 
    {
        const existingReservation = await userProjectionReservationModel.findOne({ userId: userId, projectionId: projectionId });

        if (existingReservation) 
        {
            return res.status(400).json({ message: 'User already has a reservation for this projection.' });
        }

        const newUserProjectionReservation = new userProjectionReservationModel({
            userId: userId,
            projectionId: projectionId,
            numberOfSeats: numberOfSeats
        });

        await newUserProjectionReservation.save();

        const projeciton = await ProjectionModel.findById(projectionId);
        var takenSeats = parseInt(projeciton.takenSeats) + parseInt(numberOfSeats);
        await projeciton.updateOne
        ({
            takenSeats : takenSeats,
        });
        res.status(200).json(newUserProjectionReservation);
    } 
    catch (err) 
    {
        console.error('Error adding reservation:', err);
        res.status(500).json({ message: 'Error adding reservation.' });
    }
})

app.post('/deleteReservation/:projectionId', async (req, res) => {
    
    var projectionId = req.params.projectionId;
    var userId = req.body.userId;

    if (!projectionId || !userId) 
    {
        return res.status(400).send("Projection ID and User ID are required");
    }

    try 
    {
        const userProjectionReservation = await userProjectionReservationModel.findOne({ userId: userId, projectionId: projectionId });

        if (!userProjectionReservation) 
        {
            return res.status(404).send("Reservation not found");
        }

        const projection = await ProjectionModel.findById(projectionId);

        if (!projection) 
        {
            return res.status(404).send("Projection not found");
        }

        var takenSeats = parseInt(projection.takenSeats) - parseInt(userProjectionReservation.numberOfSeats);

        await projection.updateOne({
            takenSeats: takenSeats,
        });

        await userProjectionReservationModel.findOneAndDelete({ userId: userId, projectionId: projectionId });

        console.log("Deleted");
        res.status(200).json({ message: "Reservation deleted successfully" });
    } 
    catch (err) 
    {
        console.error(err);
        res.status(500).send("Error deleting reservation");
    }
});


app.get("/futureReservations/:userId", async (req, res) => {
    const currentTime = new Date();
    const userId = req.params.userId;

    try 
    {
        const reservations = await userProjectionReservationModel.find({ userId: userId }).populate('projectionId');
        const futureReservations = [];

        for (const reservation of reservations) 
        {
            const projection = await ProjectionModel.findById(reservation.projectionId);

            if (projection.showTime > currentTime) 
            {
                const projectionWithBase64 = {
                    ...projection.toObject(),
                    img: {
                        data: projection.img.data.toString('base64'),
                        contentType: projection.img.contentType
                    }
                };

                futureReservations.push({
                    projection: projectionWithBase64,
                    numberOfSeats: reservation.numberOfSeats
                });
            }
        }

        res.json({ futureReservations: futureReservations });
    } 
    catch (err) 
    {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Error fetching reservations' });
    }
});

app.get("/pastReservations/:userId", async (req, res) => {
    const currentTime = new Date();
    const userId = req.params.userId;

    try 
    {
        const reservations = await userProjectionReservationModel.find({ userId: userId }).populate('projectionId');
        const pastReservations = [];
        for (const reservation of reservations) 
        {
            const projection = await ProjectionModel.findById(reservation.projectionId);

            if (projection.showTime < currentTime) 
            {
                const projectionWithBase64 = {
                    ...projection.toObject(),
                    img: {
                        data: projection.img.data.toString('base64'),
                        contentType: projection.img.contentType
                    }
                };

                pastReservations.push({
                    projection: projectionWithBase64,
                    numberOfSeats: reservation.numberOfSeats
                });
            }
        }
        res.json({ pastReservations: pastReservations });
    } 
    catch (err) 
    {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Error fetching reservations' });
    }
});

app.get("/reservations/:projectionId", async (req, res) => {
    const projectionId = req.params.projectionId;
    console.log(`Received request for projectionId: ${projectionId}`);

    try 
    {
        const reservations = await userProjectionReservationModel.find({ projectionId: projectionId }).populate('userId', 'username');

        const reservationDetails = reservations.map(reservation => ({
            username: reservation.userId.username,
            numberOfSeats: reservation.numberOfSeats,
            userId: reservation.userId._id,
            projectionId: reservation.projectionId
        }));

        res.json({ reservations: reservationDetails });
    } 
    catch (err) 
    {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Error fetching reservations' });
    }
});

//likes
app.post("/likeProjection/:projectionId", async (req, res) => {
    var projectionId = req.params.projectionId;
    var userId = req.body.userId;

    try 
    {
        const existingLike = await userProjectionLikedModel.findOne({ userId: userId, projectionId: projectionId });

        if (existingLike) 
        {
            return res.status(400).json({ message: 'User has already liked this projection.' });
        }

        const newUserProjectionLike = new userProjectionLikedModel({
            userId: userId,
            projectionId: projectionId,
        });

        await newUserProjectionLike.save();
        res.status(200).json(newUserProjectionLike);
    } 
    catch (err) 
    {
        console.error('Error liking projection:', err);
        res.status(500).json({ message: 'Error liking projection.' });
    }
})

app.post('/deleteLike/:projectionId', async (req,res) => 
{
    var projectionId = req.params.projectionId;
    var userId = req.body.userId;
  try 
  {
    await userProjectionLikedModel.findOneAndDelete({ userId: userId, projectionId: projectionId });
    console.log("Deleted");
    res.status(200).json({ message: "Like deleted successfully" });
  }
  catch (err) 
  {
    console.error(err); 
    res.status(500).send("Error deleting projection user"); 
  }
});

app.get("/likes/:userId", async (req, res) => {
    const userId = req.params.userId;
    console.log(`Received request for userId: ${userId}`);
    try 
    {
        const likes = await userProjectionLikedModel.find({ userId: userId });
        const projectionIds = likes.map(like => like.projectionId);

        const projections = await ProjectionModel.find({
            _id: { $in: projectionIds },
        });

        res.json({ projections: projections });
    } 
    catch (err) 
    {
        console.error('Error fetching likes:', err);
        res.status(500).json({ error: 'Error fetching likes' });
    }
});

app.get("/likes/:userId/:projectionId", async (req, res) => {
    const { userId, projectionId } = req.params;
    console.log(`Checking if user ${userId} has liked projection ${projectionId}`);

    try 
    {
        const like = await userProjectionLikedModel.findOne({ userId: userId, projectionId: projectionId });
        res.json({ liked: !!like });
    } 
    catch (err)
    {
        console.error('Error checking like status:', err);
        res.status(500).json({ error: 'Error checking like status' });
    }
});

module.exports = app;

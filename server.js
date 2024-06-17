// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://tejasadmin:tejasadmin@erp.9vng5db.mongodb.net/FRAC?retryWrites=true&w=majority&appName=erp', { useNewUrlParser: true, useUnifiedTopology: true });

const teamSchema = new mongoose.Schema({
  teamCode: String,
  teamNumber: String,
  scannedData: [
    {
      data: String,
      timestamp: String,
    },
  ],
});

const Team = mongoose.model('Team', teamSchema);

// Routes
app.post('/api/teams', async (req, res) => {
  const { teamCode, teamNumber } = req.body;

  try {
    let team = await Team.findOne({ teamCode, teamNumber });

    if (team) {
      // If the team already exists, return the existing team data
      res.status(200).send(team);
    } else {
      // If the team does not exist, create a new team
      team = new Team({ teamCode, teamNumber, scannedData: [] });
      const savedTeam = await team.save();
      res.status(200).send(savedTeam);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/scan', async (req, res) => {
  const { teamNumber, data, timestamp } = req.body;

  try {
    const team = await Team.findOne({ teamNumber });

    if (team) {
      // Check if the scanned data already exists
      const dataExists = team.scannedData.some((scan) => scan.data === data);
      if (dataExists) {
        return res.status(400).send({ message: 'Data already exists' });
      }

      // Add new scanned data
      team.scannedData.push({ data, timestamp });
      const updatedTeam = await team.save();
      res.status(200).send(updatedTeam);
    } else {
      res.status(404).send({ message: 'Team not found' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/teams/:teamNumber', async (req, res) => {
  const { teamNumber } = req.params;

  try {
    const team = await Team.findOne({ teamNumber });

    if (team) {
      res.status(200).send(team);
    } else {
      res.status(404).send({ message: 'Team not found' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

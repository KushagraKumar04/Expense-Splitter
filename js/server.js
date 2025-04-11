// Import necessary packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // load environment variables from .env

// Initialize the express app FIRST
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup AFTER initializing the app
app.use(cors());

// Spotify API credentials from environment variables
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;


// Function to retrieve Spotify access token
async function getAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = 'grant_type=client_credentials';

    try {
        const response = await axios.post(tokenUrl, body, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining access token:', error.response.data);
        throw error;
    }
}

// (Removed duplicate import and credential declarations; now centralized above)

app.get('/api/random-track', async (req, res) => {
    try {
      const token = await getAccessToken();
  
      // 1. Get playlist info to find total tracks
      const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
      const playlistRes = await axios.get(playlistUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const totalTracks = playlistRes.data.tracks.total;
  
      // 2. Choose a random track index
      const randomIndex = Math.floor(Math.random() * totalTracks);
  
      // 3. Fetch one track at the random index
      const tracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${randomIndex}&limit=1`;
      const trackRes = await axios.get(tracksUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // 4. Extract track details
      const trackItem = trackRes.data.items[0].track;
      const trackInfo = {
        name: trackItem.name,
        artist: trackItem.artists[0].name,
        albumCover: trackItem.album.images[1].url,   // medium-size album art
        spotifyUrl: trackItem.external_urls.spotify
      };
      res.json(trackInfo);
    } catch (error) {
      console.error('Error fetching track:', error.response ? error.response.data : error);
      res.status(500).json({ error: 'Failed to fetch track' });
    }
  });

  module.exports = app;
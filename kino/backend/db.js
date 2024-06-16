const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/kino', {
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

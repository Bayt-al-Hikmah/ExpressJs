const express = require('express');
const authRoutes = require('./api/Auth');
const userRoutes= require('./api/User');
const taskRoutes= require('./api/Task');
const { limiter} = require('./middleware/limit');
const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(limiter);


app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.get('/', (req,res) => {
  res.render('index');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
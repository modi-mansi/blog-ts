import express from 'express';
import Sequelize from 'sequelize';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { createModels } from './models';
import { CommentInstance } from 'models/Comment';
import { PostInstance } from 'models/Post';
import { UserInstance } from 'models/User';

const Op = Sequelize.Op;

const app: express.Application = express();
app.use(bodyParser.urlencoded({ limit: "500mb", extended: false }));
app.use(bodyParser.json({ limit: "500mb" }));
const sequelizeConfig = require('./config/sequelizeConfig.json');
const db = createModels(sequelizeConfig);
db.sequelize.sync();


// GET Get all users
app.get('/users', (req: Request, res: Response) => {
  db.User.findAll()
    .then((users: UserInstance[]) => res.status(200).json({ users }))
    .catch(err => res.status(500).json({ err: ['oops', err] }));
});

// POST create user
app.post('/user', (req, res) => {
  db.User.create(
    {
      name: req.body.name
    }
  )
    .then(user => res.status(201).json({ user }))
    .catch(err => res.status(500).json({ err: ['oops', err] }))
})


// POST create a post with userId
app.post('/addPost', (req: Request, res: Response) => {
  db.Post.create(
    req.body
  )
    .then(post => res.status(201).json({ post }))
    .catch(err => res.status(500).json({ err: ['oops', err] }))
});

// Get all post
app.get('/posts', (req: Request, res: Response) => {
  db.Post.findAll({ offset: req.body.start, limit: req.body.length })
    .then((posts: PostInstance[]) => res.status(200).json({ posts }))
    .catch(err => res.status(500).json({ err: ['oops', err] }));
});


// Get all post details/content
app.get('/postsContent/:id', (req: Request, res: Response) => {
  db.Post.findAll({ where: { id: req.params.id }, })
    .then((posts: PostInstance[]) => res.status(200).json({ posts }))
    .catch(err => res.status(500).json({ err: ['oops', err] }));
});


// POST comment onm post
app.post('/comment', async (req: Request, res: Response) => {
  try {
    const comment = await db.Comment.create(req.body);
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ err: ['oops', err] });
  }
});

app.get('/comments', (req: Request, res: Response) => {
  db.Comment.findAll()
    .then((comments: CommentInstance[]) => res.status(200).json({ comments }))
    .catch(err => res.status(500).json({ err: ['oops', err] }));
});


// GET all posts a user has authored
app.get('/users/:id/posts', (req: Request, res: Response) => {
  db.User.findById(req.params.id)
    .then(user => user.getPosts())
    .then(posts =>
      res.status(200).json({ posts })
    )
    .catch(err => res.status(500).json({ err: ['oops', err] }))
});


app.listen(5000, () => {
  console.log('App listening on port 5000');
});

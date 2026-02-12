import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

let todos= [
    {
        "id" : 1,
        "task" : "learn node",
        "priority": "low",
        completed : true
    },
    {
         "id" : 2,
        "task" : "learn express",
        "priority": "low",
         "completed" : true
    }
];

app.get('/todos', (req,res)=>{
    let filterTodo= [...todos];
    if(req.query.completed){
        let completed= req.query.completed === 'true';
        filterTodo= filterTodo.filter( todo => todo.completed === completed);   
    }
    if(req.query.priority){
        filterTodo= filterTodo.filter( todo => todo.priority === req.query.priority);
    }
    res.status(200).json({
        success: true,
        length: filterTodo.length,
        data: filterTodo
    });
});
app.get('/todos/:id', (req,res)=>{
    let id= Number(req.params.id);
    let todo= todos.find( todo => todo.id===id);
    if(!todo){
        return res.status(404).json({message: "Todo not found"});
    }
    res.status(200).json(todo);
});
app.post('/todos', (req,res)=>{
    let {task,priority,completed=false}= req.body;
    if(!task || !priority){
        return res.status(400).json({
            success: false,
            message: "Task and priority are required fields"
        });
    }
    let newTask= {
        id: todos.length,
        task,
        priority,
        completed
    };
    todos.push(newTask);
    res.status(201).json({
        success: true,
        message: "new todo is succesfully added",
        data :newTask
    });
});
app.put('/todos/:id', (req,res)=>{
    let id= Number(req.params.id);
    let todoIndex= todos.findIndex( todo => todo.id===id);
    if(todoIndex===-1){
        return res.status(404).json({
            success: false,
            message: "Todo not found"
        });
    }
    let {task,priority,completed}= req.body;
    todos[todoIndex]= {
        id,
        task,
        priority,
        completed
    };
    res.status(200).json({
        success: true,
        message: "Todo updated successfully",
        data: todos[todoIndex]
    });
});
app.patch('/todos/:id', (req,res)=>{
    let id= Number(req.params.id);
    let todoIndex= todos.findIndex( todo => todo.id===id);
    if(todoIndex===-1){
        return res.status(404).json({
            success: false,
            message: "Todo not found"
        });
    }
    let {task,priority,completed}= req.body;
    todos[todoIndex]= {
        id,
        task,
        priority,
        completed
    };
    res.status(200).json({
        success: true,
        message: "Todo updated successfully",
        data: todos[todoIndex]
    });
});
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
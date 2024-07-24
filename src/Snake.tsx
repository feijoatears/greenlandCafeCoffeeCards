import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import styles from "./snake.module.css";
import apple from "../src/resources/images/apple.png"
let speed = 1;
let interval: NodeJS.Timeout | null;
const Snake = () => 
{
    //very messy but does the job. might revise later
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const keyListenerRef = useRef<(e: KeyboardEvent) => void>()
    useEffect(() => 
    {
        type Direction = 'w' | 'a' | 's' | 'd';
        
        interface Coordinate
        {
            x: number;
            y: number;
        }
        interface Segment
        {
            position: Coordinate,
            color: string
        }
        
        class Snake
        {
            body: Segment[];            
            
            constructor(body: Segment[])
            {
                this.body = body;
            }
            
            public get head() : Segment
            {
                return this.body[0];
            }
            
        }
        class Food
        {
            position: Coordinate;
            image : HTMLImageElement;
            constructor()
            {
                this.position = {x:0, y:0};
                this.image = new Image;
                this.image.src = apple;
            }
        }
        const board = document.getElementById(styles.board) as HTMLCanvasElement,
              context = board.getContext('2d') as CanvasRenderingContext2D;
              board.height = 400;
              board.width = 400;

        const food: Food = new Food;
        let snake: Snake = null;

        const xUnit = 10, yUnit = 10;
        let direction: Direction = 'w';
        const move = () => 
        {
            if (snake.head.position.x < 0) snake.head.position.x = board.width - xUnit;
            if (snake.head.position.x > board.width - xUnit) snake.head.position.x = 0;
            if (snake.head.position.y < 0) snake.head.position.y = board.height - yUnit ;
            if (snake.head.position.y > board.height - yUnit) snake.head.position.y = 0;

            const headPos = { ...snake.head.position };

            switch (direction) 
            {
                case 'w':
                    snake.head.position.y -= yUnit;
                    break;
                case 'a':
                    snake.head.position.x -= xUnit;
                    break;
                case 's':
                    snake.head.position.y += yUnit;
                    break;
                case 'd':
                    snake.head.position.x += xUnit;
                    break;
            }
            context.fillStyle = snake.head.color;
            context.beginPath();
            context.arc(snake.head.position.x + xUnit / 2, snake.head.position.y + yUnit/2, 5, 0, Math.PI * 2);
            context.fill()
            context.closePath()

            for (let i = snake.body.length - 1; i > 0; i--) 
            {
                snake.body[i].position = snake.body[i - 1].position ;
            }
            if (snake.body.length > 1) 
            {
                snake.body[1].position = headPos;
            }

            for (let i = 1; i < snake.body.length; i++) 
            {
                const currentSegment = snake.body[i];
                
                context.fillStyle = currentSegment.color;
                context.beginPath();
                context.arc(currentSegment.position.x + xUnit / 2,currentSegment.position.y + yUnit/2, 5, 0, Math.PI * 2);
                context.fill()
                context.closePath()

            }
        };

        const checkCollision = () =>
        {
            for(let i = 1; i < snake.body.length; i++)
            {
                if(snake.head.position.x === snake.body[i].position.x && snake.head.position.y === snake.body[i].position.y)
                {
                    setGameOver(true);
                }
            }
            if(
                snake.head.position.x === food.position.x &&
                snake.head.position.y === food.position.y
            )
            {
                addSegment();
                generateFood()
            }
        }

        const addSegment = () =>
        {
            snake.body.push(
                {
                    position: 
                    {
                        x: snake.body[snake.body.length - 1].position.x,
                        y: snake.body[snake.body.length - 1].position.y
                    },
                    color: "rgb(0,255,0)"
                })
            setScore(prevScore => prevScore + 1);
            
        }

        let canMove = true;

        const handleKeyPress = (e: KeyboardEvent) =>
        {
            const key  = e.key.toLowerCase();
            if(key === "escape")
            {
                (window as any).electron.keyClose();
            }
            if(key === 'r')
            {
                init()
            }
            if(key === "+")
            {
                console.log("decreasing")
                if(speed < 20) changeSpeed(1);
                
            }
            if(key === "-")
            {
                console.log("increasing")
                if(speed > 1) changeSpeed(-1)
            }

            if(!canMove) return
            canMove = false;
 
            if(key === "w" && direction != 's') direction = 'w';
            if(key === "a" && direction != 'd') direction = 'a';
            if(key === "s" && direction != 'w') direction = 's';
            if(key === "d" && direction != 'a') direction = 'd';

            setTimeout(() => {canMove = true;}, 50)
        }

        const generateFood = () =>
        {
            const x = Math.floor(Math.ceil(Math.random() * 390 / 10) * 10),
                  y = Math.floor(Math.ceil(Math.random() * 390 / 10) * 10);
            for(let i = 0; i < snake.body.length; i++)
            {
                if(x === snake.body[i].position.x && y === snake.body[i].position.y)
                {
                    generateFood();
                    break;
                }
            }
            food.position.x = x;
            food.position.y = y;            
        }  
        
        // starting, ending, loop functions 

        const gameLoop = () =>
        {
            if(gameOver)
            {
                return;
            }
            context.clearRect(0, 0, board.width, board.height);
            context.drawImage(food.image, food.position.x, food.position.y)
            move();
            checkCollision();
        }

        const init = () =>
        {
            snake = new Snake(
              [
                {
                    position: {x: 150, y: 0}, 
                    color: "rgb(255,0,0)"
                },
                {
                    position: {x: -20, y: -10}, 
                    color: "rgb(0,255,0)"
                },
                {
                    position: {x: -30, y: -20}, 
                    color: "rgb(0,255,0)"
                }
              ])
            direction = 'w';     
            generateFood();
            setScore(0)
            if(interval)
            {
                clearInterval(interval);
            }
            interval = setInterval(gameLoop, 100 / speed);
            if(keyListenerRef.current)
            {
                removeEventListener('keydown', keyListenerRef.current);
            }
            keyListenerRef.current = handleKeyPress;
            addEventListener('keydown', keyListenerRef.current);
            setGameOver(false)
        }
        
        const showGameOverScreen = async () =>
        {
            
            clearInterval(interval);
            
            await (window as any).electron.showMessage(`Score: ${score}\nYou should probably be working :)`).then((returnVal:number) =>
            {
                if(returnVal === 0)
                {
                    init()
                }

            });
        }
        
        const changeSpeed = (change:number) =>
        {
            console.log(speed)
            console.log("gegege")
            clearInterval(interval);
            speed += change;
            interval = setInterval(gameLoop, 100 / speed);
        }

        if(gameOver)
        {
            showGameOverScreen()
        }
        else
        {
            init();
        }
        return () =>
        {
            if(interval)
            {
                clearInterval(interval);
            }
            if(keyListenerRef.current)
            {
                removeEventListener('keydown', keyListenerRef.current)
            }
        }
    }, [gameOver])
    return (
        <div id={styles.gameWrap}>
            <div id={styles.score}>
                <div>Score: {score}</div> 
                <div>Press +/- to change speed</div>
            </div>
            <canvas id={styles.board}/>
        </div>
    ); 
};
const root = createRoot(document.getElementById('root'));
root.render(<Snake/>);
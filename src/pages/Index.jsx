import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Heading, VStack, HStack, Grid, GridItem, useInterval } from "@chakra-ui/react";
import { FaArrowUp, FaArrowLeft, FaArrowRight, FaArrowDown } from "react-icons/fa";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
];

const getRandomShape = () => {
  const randomIndex = Math.floor(Math.random() * SHAPES.length);
  return SHAPES[randomIndex];
};

const Index = () => {
  const [board, setBoard] = useState(
    Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0)),
  );
  const [currentShape, setCurrentShape] = useState(getRandomShape());
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 4 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const moveDown = useCallback(() => {
    setCurrentPosition((prev) => ({
      ...prev,
      row: prev.row + 1,
    }));
  }, []);

  const moveLeft = () => {
    setCurrentPosition((prev) => ({
      ...prev,
      col: prev.col - 1,
    }));
  };

  const moveRight = () => {
    setCurrentPosition((prev) => ({
      ...prev,
      col: prev.col + 1,
    }));
  };

  const rotateShape = () => {
    setCurrentShape((prev) => {
      const newShape = prev[0].map((_, index) => prev.map((row) => row[index]).reverse());
      return newShape;
    });
  };

  const placeShape = useCallback(() => {
    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      currentShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell) {
            const boardRow = currentPosition.row + rowIndex;
            const boardCol = currentPosition.col + colIndex;
            newBoard[boardRow][boardCol] = 1;
          }
        });
      });
      return newBoard;
    });
    setCurrentShape(getRandomShape());
    setCurrentPosition({ row: 0, col: 4 });
  }, [currentShape, currentPosition]);

  const clearRows = useCallback(() => {
    setBoard((prev) => {
      const newBoard = prev.filter((row) => row.some((cell) => cell === 0));
      const clearedRows = prev.length - newBoard.length;
      setScore((prevScore) => prevScore + clearedRows * 10);
      return [
        ...Array(clearedRows)
          .fill()
          .map(() => Array(BOARD_WIDTH).fill(0)),
        ...newBoard,
      ];
    });
  }, []);

  const checkGameOver = useCallback(() => {
    const isOverlap = currentShape.some((row, rowIndex) =>
      row.some((cell, colIndex) => {
        if (cell) {
          const boardRow = currentPosition.row + rowIndex;
          const boardCol = currentPosition.col + colIndex;
          return board[boardRow]?.[boardCol];
        }
        return false;
      }),
    );
    if (isOverlap) {
      setIsGameOver(true);
    }
  }, [board, currentPosition, currentShape]);

  useEffect(() => {
    checkGameOver();
    if (
      currentPosition.row + currentShape.length === BOARD_HEIGHT ||
      currentShape.some((row, rowIndex) =>
        row.some((cell, colIndex) => {
          if (cell) {
            const boardRow = currentPosition.row + rowIndex + 1;
            const boardCol = currentPosition.col + colIndex;
            return board[boardRow]?.[boardCol];
          }
          return false;
        }),
      )
    ) {
      placeShape();
      clearRows();
    }
  }, [board, currentPosition, currentShape, placeShape, clearRows, checkGameOver]);

  useInterval(
    () => {
      moveDown();
    },
    isGameOver ? null : speed,
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        moveLeft();
      } else if (e.key === "ArrowRight") {
        moveRight();
      } else if (e.key === "ArrowDown") {
        moveDown();
      } else if (e.key === "ArrowUp") {
        rotateShape();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveDown]);

  useEffect(() => {
    if (score > 0 && score % 50 === 0) {
      setSpeed((prevSpeed) => prevSpeed * 0.9);
    }
  }, [score]);

  return (
    <VStack spacing={8} p={8}>
      <Heading as="h1" size="xl">
        Tetris
      </Heading>
      <HStack spacing={8}>
        <Box border="2px solid" borderColor="gray.200" p={4}>
          <Grid templateColumns={`repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`} gap={1}>
            {board.map((row, rowIndex) => row.map((cell, colIndex) => <GridItem key={`${rowIndex}-${colIndex}`} bg={cell || (currentShape.some((shapeRow, shapeRowIndex) => shapeRow.some((shapeCell, shapeColIndex) => shapeCell && rowIndex === currentPosition.row + shapeRowIndex && colIndex === currentPosition.col + shapeColIndex)) ? "blue.500" : "gray.100")} w={BLOCK_SIZE} h={BLOCK_SIZE} />))}
          </Grid>
        </Box>
        <VStack spacing={4} align="start">
          <Heading as="h2" size="lg">
            Score: {score}
          </Heading>
          <VStack spacing={2} align="start">
            <Button leftIcon={<FaArrowUp />} onClick={rotateShape} disabled={isGameOver}>
              Rotate
            </Button>
            <Button leftIcon={<FaArrowLeft />} onClick={moveLeft} disabled={isGameOver}>
              Left
            </Button>
            <Button leftIcon={<FaArrowRight />} onClick={moveRight} disabled={isGameOver}>
              Right
            </Button>
            <Button leftIcon={<FaArrowDown />} onClick={moveDown} disabled={isGameOver}>
              Down
            </Button>
          </VStack>
        </VStack>
      </HStack>
      {isGameOver && (
        <Heading as="h2" size="xl" color="red.500">
          Game Over!
        </Heading>
      )}
    </VStack>
  );
};

export default Index;

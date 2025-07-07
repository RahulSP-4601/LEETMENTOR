-- Problem 1: Two Sum
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    1,
    'Two Sum',
    'Easy',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'Array'
);

INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    1,
    '{"nums": [2, 7, 11, 15], "target": 9}',
    '[0, 1]'
),
(
    1,
    '{"nums": [3, 2, 4], "target": 6}',
    '[1, 2]'
),
(
    1,
    '{"nums": [3, 3], "target": 6}',
    '[0, 1]'
),
(
    1,
    '{"nums": [1, 2, 3, 4], "target": 7}',
    '[2, 3]'
),
(
    1,
    '{"nums": [1, 5, 3, 6], "target": 10}',
    '[1, 3]'
),
(
    1,
    '{"nums": [-1, -2, -3, -4, -5], "target": -8}',
    '[2, 4]'
),
(
    1,
    '{"nums": [0, 4, 3, 0], "target": 0}',
    '[0, 3]'
),
(
    1,
    '{"nums": [1, 3, 5, 7], "target": 8}',
    '[0, 3]'
),
(
    1,
    '{"nums": [5, 75, 25], "target": 100}',
    '[1, 2]'
),
(
    1,
    '{"nums": [2, 5, 5, 11], "target": 10}',
    '[1, 2]'
);

-- Problem 2: Valid Parentheses
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    2,
    'Valid Parentheses',
    'Easy',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
    'Stack'
);

INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    2,
    '"()"',
    '"true"'
),
(
    2,
    '"()[]{}"',
    '"true"'
),
(
    2,
    '"(]"',
    '"false"'
),
(
    2,
    '"([)]"',
    '"false"'
),
(
    2,
    '"{[]}"',
    '"true"'
),
(
    2,
    '""',
    '"true"'
),
(
    2,
    '"(((((((((())))))))))"',
    '"true"'
),
(
    2,
    '"({[()]})"',
    '"true"'
),
(
    2,
    '"{[("',
    '"false"'
),
(
    2,
    '"[{()}([])]"',
    '"true"'
);

-- Problem 3
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    3,
    'Merge Two Sorted Lists',
    'Easy',
    'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list and return its head.',
    'Linked List'
);

-- 10 Valid Test Cases for Problem 3
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    3,
    '{"list1": [1, 2, 4], "list2": [1, 3, 4]}',
    '[1,1,2,3,4,4]'
),
(
    3,
    '{"list1": [], "list2": []}',
    '[]'
),
(
    3,
    '{"list1": [], "list2": [0]}',
    '[0]'
),
(
    3,
    '{"list1": [5, 10, 15], "list2": [2, 3, 20]}',
    '[2,3,5,10,15,20]'
),
(
    3,
    '{"list1": [1, 1, 2], "list2": [1, 1, 2]}',
    '[1,1,1,1,2,2]'
),
(
    3,
    '{"list1": [1, 3, 5, 7], "list2": [2, 4, 6, 8]}',
    '[1,2,3,4,5,6,7,8]'
),
(
    3,
    '{"list1": [10, 20, 30], "list2": [5, 15, 25]}',
    '[5,10,15,20,25,30]'
),
(
    3,
    '{"list1": [1, 2], "list2": [3, 4, 5, 6]}',
    '[1,2,3,4,5,6]'
),
(
    3,
    '{"list1": [3, 4, 5], "list2": [1, 2]}',
    '[1,2,3,4,5]'
),
(
    3,
    '{"list1": [1], "list2": [1]}',
    '[1,1]'
);

-- Problem 4
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    4,
    'Best Time to Buy and Sell Stock',
    'Easy',
    'You are given an array prices where prices[i] is the price of a given stock on the i-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.',
    'Array'
);

-- 10 Valid Test Cases for Problem 4
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    4,
    '{"prices": [7,1,5,3,6,4]}',
    '5'
),
(
    4,
    '{"prices": [7,6,4,3,1]}',
    '0'
),
(
    4,
    '{"prices": [1,2,3,4,5]}',
    '4'
),
(
    4,
    '{"prices": [2,4,1]}',
    '2'
),
(
    4,
    '{"prices": [3,3,5,0,0,3,1,4]}',
    '4'
),
(
    4,
    '{"prices": [1]}',
    '0'
),
(
    4,
    '{"prices": [5,4,3,2,1]}',
    '0'
),
(
    4,
    '{"prices": [2,1,2,1,0,1,2]}',
    '2'
),
(
    4,
    '{"prices": [1,7,2,3,6,7,6]}',
    '6'
),
(
    4,
    '{"prices": [2,1,4]}',
    '3'
);

-- Problem 5
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    5,
    'Valid Palindrome',
    'Easy',
    'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    'String'
);

-- 10 Valid Test Cases for Problem 5
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    5,
    '{"s": "A man, a plan, a canal: Panama"}',
    'true'
),
(
    5,
    '{"s": "racecar"}',
    'true'
),
(
    5,
    '{"s": "Was it a car or a cat I saw?"}',
    'true'
),
(
    5,
    '{"s": "No lemon, no melon"}',
    'true'
),
(
    5,
    '{"s": "hello"}',
    'false'
),
(
    5,
    '{"s": "12321"}',
    'true'
),
(
    5,
    '{"s": "123abccba321"}',
    'true'
),
(
    5,
    '{"s": "0P"}',
    'false'
),
(
    5,
    '{"s": ""}',
    'true'
),
(
    5,
    '{"s": ".,!@"}',
    'true'
);

-- Problem 6
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    6,
    'Invert Binary Tree',
    'Easy',
    'Given the root of a binary tree, invert the tree and return its root. Inversion means swapping the left and right children of all nodes.',
    'Tree'
);

-- 10 Valid Test Cases for Problem 6
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES
 -- Format: input and expected_output are serialized trees (level-order) as strings
(
    6,
    '{"root": [4,2,7,1,3,6,9]}',
    '[4,7,2,9,6,3,1]'
),
(
    6,
    '{"root": [2,1,3]}',
    '[2,3,1]'
),
(
    6,
    '{"root": [1,null,2,null,3]}',
    '[1,2,null,3]'
),
(
    6,
    '{"root": []}',
    '[]'
),
(
    6,
    '{"root": [5]}',
    '[5]'
),
(
    6,
    '{"root": [1,2,null,3,null,4,null]}',
    '[1,null,2,null,3,null,4]'
),
(
    6,
    '{"root": [1,null,2,null,3,null,4]}',
    '[1,2,null,3,null,4]'
),
(
    6,
    '{"root": [3,9,20,null,null,15,7]}',
    '[3,20,9,7,15]'
),
(
    6,
    '{"root": [8,3,10,1,6,null,14]}',
    '[8,10,3,14,null,6,1]'
),
(
    6,
    '{"root": [1,2,3,4,5,6,7]}',
    '[1,3,2,7,6,5,4]'
);

-- Problem 7
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    7,
    'Balanced Binary Tree',
    'Easy',
    'Given a binary tree, determine if it is height-balanced. A binary tree is height-balanced if for every node, the height difference between its left and right subtree is at most 1.',
    'Tree'
);

-- 10 Valid Test Cases for Problem 7
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES
 -- Format: input and expected_output are serialized trees (level-order) and boolean results
(
    7,
    '{"root": [3,9,20,null,null,15,7]}',
    'true'
),
(
    7,
    '{"root": [1,2,2,3,3,null,null,4,4]}',
    'false'
),
(
    7,
    '{"root": []}',
    'true'
),
(
    7,
    '{"root": [1]}',
    'true'
),
(
    7,
    '{"root": [1,2,2,3,null,null,3,4,null,null,4]}',
    'false'
),
(
    7,
    '{"root": [1,2,2,3,null,null,3]}',
    'true'
),
(
    7,
    '{"root": [1,null,2,null,3]}',
    'false'
),
(
    7,
    '{"root": [1,2,3,4,5,6,7]}',
    'true'
),
(
    7,
    '{"root": [10,20,null,30,null,40]}',
    'false'
),
(
    7,
    '{"root": [1,2,2,3,3,3,3]}',
    'true'
);

-- Problem 8
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    8,
    'Linked List Cycle',
    'Medium',
    'Given the head of a linked list, determine if the linked list has a cycle in it. A linked list has a cycle if there is a node in the list that can be reached again by continuously following the next pointer.',
    'Linked List'
);

-- 10 Valid Test Cases for Problem 8
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES
 -- Format: input is list of node values and cycle index, expected_output is true/false
(
    8,
    '{"head": [3,2,0,-4], "pos": 1}',
    'true'
),
(
    8,
    '{"head": [1,2], "pos": 0}',
    'true'
),
(
    8,
    '{"head": [1], "pos": -1}',
    'false'
),
(
    8,
    '{"head": [1,2], "pos": -1}',
    'false'
),
(
    8,
    '{"head": [1,2,3,4,5], "pos": 2}',
    'true'
),
(
    8,
    '{"head": [1,2,3,4,5], "pos": -1}',
    'false'
),
(
    8,
    '{"head": [1], "pos": 0}',
    'true'
),
(
    8,
    '{"head": [1,2,3,4,5,6,7,8,9,10], "pos": 9}',
    'true'
),
(
    8,
    '{"head": [1,2,3,4,5,6], "pos": -1}',
    'false'
),
(
    8,
    '{"head": [1,2,3,4,5,6,7], "pos": 3}',
    'true'
);

-- Problem 9 Lowest Comman Ancestor
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    9,
    'Lowest Common Ancestor of a Binary Search Tree',
    'Medium',
    'Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST. The lowest common ancestor is defined as the lowest node in the tree that has both nodes as descendants.',
    'Tree'
);

-- Public Test Cases
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    9,
    '{"root": [6,2,8,0,4,7,9], "p": 2, "q": 8}',
    '6'
),
(
    9,
    '{"root": [6,2,8,0,4,7,9], "p": 2, "q": 4}',
    '2'
),
(
    9,
    '{"root": [6,2,8,0,4,7,9, null, null, 3, 5], "p": 3, "q": 5}',
    '4'
),
 
-- Hidden Test Cases
(
    9,
    '{"root": [5,3,6,2,4], "p": 2, "q": 4}',
    '3'
),
(
    9,
    '{"root": [10,5,15,2,7,12,20], "p": 2, "q": 7}',
    '5'
),
(
    9,
    '{"root": [10,5,15,2,7,12,20], "p": 12, "q": 20}',
    '15'
),
(
    9,
    '{"root": [3,1,4,null,2], "p": 2, "q": 4}',
    '3'
),
(
    9,
    '{"root": [8,3,10,1,6,null,14,null,null,4,7,13], "p": 1, "q": 6}',
    '3'
),
(
    9,
    '{"root": [8,3,10,1,6,null,14,null,null,4,7,13], "p": 4, "q": 7}',
    '6'
),
(
    9,
    '{"root": [2,1], "p": 2, "q": 1}',
    '2'
);

-- Problem 10 Climbing Stairs
INSERT INTO PROBLEMS (
    ID,
    TITLE,
    DIFFICULTY,
    DESCRIPTION,
    CATEGORY
) VALUES (
    10,
    'Climbing Stairs',
    'Easy',
    'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach the top.',
    'Dynamic Programming'
);

-- Public Test Cases
INSERT INTO TEST_CASES (
    PROBLEM_ID,
    INPUT,
    EXPECTED_OUTPUT
) VALUES (
    10,
    '2',
    '2'
), -- [1+1, 2]
(
    10,
    '3',
    '3'
), -- [1+1+1, 1+2, 2+1]
(
    10,
    '5',
    '8'
), -- Fibonacci-like: 5 steps → 8 ways
-- Hidden Test Cases
(
    10,
    '1',
    '1'
),
(
    10,
    '4',
    '5'
),
(
    10,
    '6',
    '13'
),
(
    10,
    '7',
    '21'
),
(
    10,
    '8',
    '34'
),
(
    10,
    '9',
    '55'
),
(
    10,
    '10',
    '89'
);
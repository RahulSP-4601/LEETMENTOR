CREATE TABLE STARTER_CODE (
    ID SERIAL PRIMARY KEY,
    PROBLEM_ID INT REFERENCES PROBLEMS(ID) ON DELETE CASCADE,
    LANGUAGE VARCHAR(20),
    CODE TEXT
);

-- Python

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    1,
    'python',
    'class Solution:\n    def twoSum(self, nums, target):\n        """\n        :type nums: List[int]\n        :type target: int\n        :rtype: List[int]\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    2,
    'python',
    'class Solution:\n    def isValid(self, s):\n        """\n        :type s: str\n        :rtype: bool\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    3,
    'python',
    'class Solution:\n    def mergeTwoLists(self, list1, list2):\n        """\n        :type list1: ListNode\n        :type list2: ListNode\n        :rtype: ListNode\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    4,
    'python',
    'class Solution:\n    def maxProfit(self, prices):\n        """\n        :type prices: List[int]\n        :rtype: int\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    5,
    'python',
    'class Solution:\n    def isPalindrome(self, s):\n        """\n        :type s: str\n        :rtype: bool\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    6,
    'python',
    'class Solution:\n    def invertTree(self, root):\n        """\n        :type root: TreeNode\n        :rtype: TreeNode\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    7,
    'python',
    'class Solution:\n    def isBalanced(self, root):\n        """\n        :type root: TreeNode\n        :rtype: bool\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    8,
    'python',
    'class Solution:\n    def hasCycle(self, head):\n        """\n        :type head: ListNode\n        :rtype: bool\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    9,
    'python',
    'class Solution:\n    def lowestCommonAncestor(self, root, p, q):\n        """\n        :type root: TreeNode\n        :type p: TreeNode\n        :type q: TreeNode\n        :rtype: TreeNode\n        """\n        '
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    10,
    'python',
    'class Solution:\n    def climbStairs(self, n):\n        """\n        :type n: int\n        :rtype: int\n        """\n        '
);

-- java

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    1,
    'java',
    'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    2,
    'java',
    'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    3,
    'java',
    'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    4,
    'java',
    'class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    5,
    'java',
    'class Solution {\n    public boolean isPalindrome(String s) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    6,
    'java',
    'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    7,
    'java',
    'class Solution {\n    public boolean isBalanced(TreeNode root) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    8,
    'java',
    'class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    9,
    'java',
    'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Your code here\n    }\n}'
);

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    10,
    'java',
    'class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}'
);

-- c++

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    1,
    'cpp',
    $$CLASS SOLUTION { PUBLIC: VECTOR<INT> TWOSUM(VECTOR<INT>& NUMS, INT TARGET) { // YOUR CODE HERE RETURN {};

}

};$$),

(2,
'cpp',
$$CLASS SOLUTION { PUBLIC: BOOL ISVALID(STRING S) { // YOUR CODE HERE RETURN FALSE;

}

};$$),

(3,
'cpp',
$$STRUCT LISTNODE { INT VAL;

LISTNODE *NEXT;

LISTNODE(INT X) : VAL(X), NEXT(NULLPTR) {}
};

CLASS SOLUTION {
PUBLIC:
LISTNODE* MERGETWOLISTS(LISTNODE* LIST1, LISTNODE* LIST2) {

// Your code here

RETURN NULLPTR;

}

};$$),

(4,
'cpp',
$$CLASS SOLUTION { PUBLIC: INT MAXPROFIT(VECTOR<INT>& PRICES) { // YOUR CODE HERE RETURN 0;

}

};$$),

(5,
'cpp',
$$CLASS SOLUTION { PUBLIC: BOOL ISPALINDROME(STRING S) { // YOUR CODE HERE RETURN FALSE;

}

};$$),

(6,
'cpp',
$$STRUCT TREENODE { INT VAL;

TREENODE *LEFT, *RIGHT;

TREENODE(INT X) : VAL(X), LEFT(NULLPTR), RIGHT(NULLPTR) {}
};

CLASS SOLUTION {
PUBLIC:
TREENODE* INVERTTREE(TREENODE* ROOT) {

// Your code here

RETURN NULLPTR;

}

};$$),

(7,
'cpp',
$$STRUCT TREENODE { INT VAL;

TREENODE *LEFT, *RIGHT;

TREENODE(INT X) : VAL(X), LEFT(NULLPTR), RIGHT(NULLPTR) {}
};

CLASS SOLUTION {
PUBLIC:
BOOL ISBALANCED(TREENODE* ROOT) {

// Your code here

RETURN FALSE;

}

};$$),

(8,
'cpp',
$$STRUCT LISTNODE { INT VAL;

LISTNODE *NEXT;

LISTNODE(INT X) : VAL(X), NEXT(NULLPTR) {}
};

CLASS SOLUTION {
PUBLIC:
BOOL HASCYCLE(LISTNODE *HEAD) {

// Your code here

RETURN FALSE;

}

};$$),

(9,
'cpp',
$$STRUCT TREENODE { INT VAL;

TREENODE *LEFT, *RIGHT;

TREENODE(INT X) : VAL(X), LEFT(NULLPTR), RIGHT(NULLPTR) {}
};

CLASS SOLUTION {
PUBLIC:
TREENODE* LOWESTCOMMONANCESTOR(TREENODE* ROOT, TREENODE* P, TREENODE* Q) {

// Your code here

RETURN NULLPTR;

}

};$$),

(10,
'cpp',
$$CLASS SOLUTION { PUBLIC: INT CLIMBSTAIRS(INT N) { // YOUR CODE HERE RETURN 0;

}

};$$);

-- Javascript

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    1,
    'javascript',
    $$FUNCTION TWOSUM(NUMS, TARGET) { // YOUR CODE HERE RETURN [];

}$$),

(2,
'javascript',
$$FUNCTION ISVALID(S) { // YOUR CODE HERE RETURN FALSE;

}$$),

(3,
'javascript',
$$FUNCTION MERGETWOLISTS(LIST1,
LIST2) { // YOUR CODE HERE RETURN NULL;

}$$),

(4,
'javascript',
$$FUNCTION MAXPROFIT(PRICES) { // YOUR CODE HERE RETURN 0;

}$$),

(5,
'javascript',
$$FUNCTION ISPALINDROME(S) { // YOUR CODE HERE RETURN FALSE;

}$$),

(6,
'javascript',
$$FUNCTION INVERTTREE(ROOT) { // YOUR CODE HERE RETURN NULL;

}$$),

(7,
'javascript',
$$FUNCTION ISBALANCED(ROOT) { // YOUR CODE HERE RETURN FALSE;

}$$),

(8,
'javascript',
$$FUNCTION HASCYCLE(HEAD) { // YOUR CODE HERE RETURN FALSE;

}$$),

(9,
'javascript',
$$FUNCTION LOWESTCOMMONANCESTOR(ROOT,
P,
Q) { // YOUR CODE HERE RETURN NULL;

}$$),

(10,
'javascript',
$$FUNCTION CLIMBSTAIRS(N) { // YOUR CODE HERE RETURN 0;

}$$);

-- C

INSERT INTO STARTER_CODE (
    PROBLEM_ID,
    LANGUAGE,
    CODE
) VALUES (
    1,
    'c',
    $$INT* TWOSUM(INT* NUMS, INT NUMSSIZE, INT TARGET, INT* RETURNSIZE) { // YOUR CODE HERE *RETURNSIZE = 0;

RETURN NULL;

}$$),

(2,
'c',
$$BOOL ISVALID(CHAR* S) { // YOUR CODE HERE RETURN FALSE;

}$$),

(3,
'c',
$$STRUCT LISTNODE* MERGETWOLISTS(STRUCT LISTNODE* LIST1,
STRUCT LISTNODE* LIST2) { // YOUR CODE HERE RETURN NULL;

}$$),

(4,
'c',
$$INT MAXPROFIT(INT* PRICES,
INT PRICESSIZE) { // YOUR CODE HERE RETURN 0;

}$$),

(5,
'c',
$$BOOL ISPALINDROME(CHAR* S) { // YOUR CODE HERE RETURN FALSE;

}$$),

(6,
'c',
$$STRUCT TREENODE* INVERTTREE(STRUCT TREENODE* ROOT) { // YOUR CODE HERE RETURN NULL;

}$$),

(7,
'c',
$$BOOL ISBALANCED(STRUCT TREENODE* ROOT) { // YOUR CODE HERE RETURN FALSE;

}$$),

(8,
'c',
$$BOOL HASCYCLE(STRUCT LISTNODE *HEAD) { // YOUR CODE HERE RETURN FALSE;

}$$),

(9,
'c',
$$STRUCT TREENODE* LOWESTCOMMONANCESTOR(STRUCT TREENODE* ROOT,
STRUCT TREENODE* P,
STRUCT TREENODE* Q) { // YOUR CODE HERE RETURN NULL;

}$$),

(10,
'c',
$$INT CLIMBSTAIRS(INT N) { // YOUR CODE HERE RETURN 0;

}$$);
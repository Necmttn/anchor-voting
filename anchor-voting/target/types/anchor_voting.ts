export type AnchorVoting = {
  "version": "0.0.0",
  "name": "anchor_voting",
  "instructions": [
    {
      "name": "initializeVoting",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addProposal",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "voteForProposal",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        },
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalProposalCount",
            "type": "u64"
          },
          {
            "name": "proposalList",
            "type": {
              "vec": {
                "defined": "Proposal"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UserVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "vote",
            "type": {
              "defined": "Vote"
            }
          }
        ]
      }
    },
    {
      "name": "Proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "votedUsers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "voteCount",
            "type": "u64"
          },
          {
            "name": "voteYes",
            "type": "u64"
          },
          {
            "name": "voteNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Vote",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Down"
          },
          {
            "name": "Up"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "ProposalIndexOutOfBounds",
      "msg": "No Proposal at this index"
    },
    {
      "code": 301,
      "name": "YouAlreadyVotedForThisProposal",
      "msg": "You have already voted for this proposal"
    }
  ]
};

export const IDL: AnchorVoting = {
  "version": "0.0.0",
  "name": "anchor_voting",
  "instructions": [
    {
      "name": "initializeVoting",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addProposal",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "voteForProposal",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        },
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalProposalCount",
            "type": "u64"
          },
          {
            "name": "proposalList",
            "type": {
              "vec": {
                "defined": "Proposal"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UserVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "vote",
            "type": {
              "defined": "Vote"
            }
          }
        ]
      }
    },
    {
      "name": "Proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "votedUsers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "voteCount",
            "type": "u64"
          },
          {
            "name": "voteYes",
            "type": "u64"
          },
          {
            "name": "voteNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Vote",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Down"
          },
          {
            "name": "Up"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "ProposalIndexOutOfBounds",
      "msg": "No Proposal at this index"
    },
    {
      "code": 301,
      "name": "YouAlreadyVotedForThisProposal",
      "msg": "You have already voted for this proposal"
    }
  ]
};

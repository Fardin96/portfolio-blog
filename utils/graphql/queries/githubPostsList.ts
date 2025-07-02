export const query = `
    query($owner: String!, $repo: String!, $expression: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $expression) {
          ... on Tree {
            entries {
              name
              type
              object {
                ... on Tree {
                  entries {
                    name
                    type
                    object {
                      ... on Blob {
                        text
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

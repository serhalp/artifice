import { createStorage } from "unstorage";
import netlifyBlobs from "unstorage/drivers/netlify-blobs";

// this uses file system driver for unstorage that works only on node.js
// swap with the key value of your choice in your deployed environment
export const storage = createStorage({
  driver: netlifyBlobs({
    name: "artifice",
  }),
});

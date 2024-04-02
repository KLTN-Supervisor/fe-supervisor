import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import TimeAgo from "../../../../untils/TimeAgo";

const ListComponent = ({ users, authors }) => {
  return (
    <Box marginTop={5}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={5} md={4}>
          <Paper>
            <List>
              <ListItem>
                <Typography fontWeight={600}>Lastest Users</Typography>
              </ListItem>

              <Divider />
              <Divider />
              <Divider />

              <ListItem
                sx={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr" }}
              >
                <ListItemIcon>
                  <Typography variant="subtitle2">Avatar</Typography>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="subtitle2">Name</Typography>
                </ListItemText>
                <ListItemText>
                  <Typography variant="subtitle2">Joined at</Typography>
                </ListItemText>
              </ListItem>
              <Divider />
              {users.length === 0 ? (
                <Box
                  sx={{
                    minHeight: "250px",
                    display: "flex",
                    flexFlow: "row wrap",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography align="center">
                    <CircularProgress />
                  </Typography>
                </Box>
              ) : (
                users.map((item, i) => (
                  <ListItem
                    key={i}
                    sx={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr" }}
                  >
                    <ListItemIcon>
                      <Avatar src={item.profile_picture} alt={""} />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        {item.username}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {item.full_name}
                      </Typography>
                    </ListItemText>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        <TimeAgo
                          type="admin-short"
                          created_at={item.created_at}
                        />
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={5} md={8}>
          <Paper>
            <List>
              <ListItem>
                <Typography fontWeight={600}>Top Authors</Typography>
              </ListItem>
              <Divider />
              <Divider />
              <Divider />

              <ListItem
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 3fr 0.6fr 0.1fr 3fr 1.2fr 1.2fr",
                }}
              >
                <ListItemIcon>
                  <Typography variant="subtitle2">Avatar</Typography>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="subtitle2">Author</Typography>
                </ListItemText>
                <ListItemText>
                  <Typography variant="subtitle2">Posts</Typography>
                </ListItemText>

                <div
                  style={{
                    width: "1px",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  }}
                />

                <ListItemText>
                  <Typography variant="subtitle2">Latest Post</Typography>
                </ListItemText>
              </ListItem>
              <Divider />
              {authors.length === 0 ? (
                <Box
                  sx={{
                    minHeight: "250px",
                    display: "flex",
                    flexFlow: "row wrap",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography align="center">
                    <CircularProgress />
                  </Typography>
                </Box>
              ) : (
                authors.map((item, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 3fr 0.6fr 0.1fr 3fr 1.2fr 1.2fr",
                    }}
                  >
                    <ListItemIcon>
                      <Avatar src={item.profile_picture} alt={""}></Avatar>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        {item.username}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {item.full_name}
                      </Typography>
                    </ListItemText>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        {item.posts_count}
                      </Typography>
                    </ListItemText>
                    <div
                      style={{
                        width: "1px",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    />
                    <ListItemText>
                      <Typography
                        variant="body1"
                        component="h6"
                        sx={{
                          opacity:
                            item.latest_post.content.length === 0 ? 0.6 : 1,
                        }}
                      >
                        Title:{" "}
                        {item.latest_post.content.length > 15
                          ? item.latest_post.content.substring(0, 15) + "..."
                          : item.latest_post.content || "No title"}
                      </Typography>
                    </ListItemText>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        {item.latest_post.reacts_count} likes
                      </Typography>
                    </ListItemText>
                    <ListItemText>
                      <Typography variant="body1" component="h6">
                        {item.latest_post.comments_count} cmts
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListComponent;

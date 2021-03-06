import React, { Component } from 'react';
import { Dialog, Breadcrumbs, Typography, Grid, DialogTitle, Button, DialogContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, TextField, InputAdornment, Chip } from '@material-ui/core';
import storageManager from '~storageManager/storageManager';
import { Close, Folder, InsertDriveFile, NoteAdd, ArrowUpward, NavigateNext } from '@material-ui/icons';
import { StorageDirectory } from '~storageManager/types';

type StorageBrowserProps = {
  onPath: (path: string) => void;
  close: () => void;
  open: boolean;
  title: string;
  canCreateFile?: boolean;
};

type StroageBrowserState = {
  newFileOpen: boolean;
  newFileName: string;
  directory: StorageDirectory;
  path: string[];
};

export default class StorageBrowser extends Component<StorageBrowserProps, StroageBrowserState> {
  constructor(props: StorageBrowserProps) {
    super(props);

    const path = storageManager.parsePath(storageManager.defaultPath);

    this.getDirectory(path);

    this.state = {
      newFileOpen: false,
      newFileName: (new Date()).toISOString(),
      directory: [],
      path,
    };

    this.handleStorageServiceChange = this.handleStorageServiceChange.bind(this);

    storageManager.on('storageServiceChanged', this.handleStorageServiceChange);
  }

  private handleStorageServiceChange() {
    const path = storageManager.parsePath(storageManager.defaultPath);
    this.setPath(path);
  }

  public componentWillUnmount() {
    storageManager.off('storageServiceChanged', this.handleStorageServiceChange);
  }

  public componentDidUpdate(previousProps: StorageBrowserProps) {
    if (previousProps.open || !this.props.open) {
      return;
    }
    this.getDirectory(this.state.path);
  }

  private getDirectory(path: string[]) {
    storageManager.getDirectory(storageManager.stringifyPath(path))
      .then(directory => {
        if (!directory) {
          console.log('Fail to get directory');
          return;
        }
        this.setState({
          directory,
        })
      });
  }

  private setNewFileName(newFileName: string) {
    this.setState({
      newFileName,
    });
  }

  private openNewFileDialog() {
    this.setState({ newFileOpen: true });
  }

  private closeNewFileDialog() {
    this.setState({ newFileOpen: false });
  }

  private setPath(path: string[]) {
    this.setState({ path });
    this.getDirectory(path);
  }

  public render() {
    const {
      open,
      close,
      title,
      onPath,
      canCreateFile,
    } = this.props;


    const {
      path,
      directory,
      newFileName,
      newFileOpen,
    } = this.state;

    const GoUpButton = () => (
      <Grid item>
        <Button
          disabled={path.length < 2}
          onClick={() => {
            const { path } = this.state;
            path.pop();
            this.setPath(path);
          }}
        ><ArrowUpward /></Button>
      </Grid>
    );

    const FileList = () => (
      <DialogContent>
        <List>
          {directory.map(directoryEntry => <ListItem
            key={directoryEntry.name}
            button
            onClick={() => {
              const targetPath = [...path, directoryEntry.name];
              if (directoryEntry.isDirectory) {
                this.setPath(targetPath);
                return;
              }
              onPath(storageManager.stringifyPath(targetPath));
              close();
            }}
          >
            <ListItemAvatar>
              <Avatar>
                {directoryEntry.isDirectory ? <Folder /> : <InsertDriveFile />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={directoryEntry.name} />
          </ListItem>)}
        </List>
      </DialogContent>
    );

    return (
      <Dialog
        onKeyDown={event => event.nativeEvent.stopImmediatePropagation()}
        fullScreen
        open={open}
        onClose={() => close()}
      >
        <DialogTitle>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{title}</Typography>
            </Grid>
            <Grid item>
              <Button variant="text" onClick={close}><Close fontSize="large" /></Button>
            </Grid>
          </Grid>
          <Grid container alignItems="center">
            <GoUpButton />
            <Grid item xs>
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}>
                {path.map((directoryName, index) => {
                  const targetPath = path.slice(0, index + 1);
                  return (
                    <Chip
                      size="small"
                      key={directoryName}
                      label={directoryName}
                      style={{textDecoration: 'none'}}
                      onClick={() => this.setPath(targetPath)}
                    />
                  )
                })}
              </Breadcrumbs>
            </Grid>
            <Grid item>
              <Button
                disabled={!canCreateFile}
                onClick={() => this.openNewFileDialog()}
              ><NoteAdd /></Button>
              <Dialog open={newFileOpen} onClose={() => this.closeNewFileDialog()}>
                <DialogTitle>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <Typography variant="h4">Create New File</Typography>
                    </Grid>
                    <Grid item>
                      <Button variant="text" onClick={() => this.closeNewFileDialog()}><Close fontSize="large" /></Button>
                    </Grid>
                  </Grid>
                </DialogTitle>
                <DialogContent>
                  <TextField
                    fullWidth
                    label="File Name"
                    value={newFileName}
                    onChange={event => this.setNewFileName(event.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                        <Button onClick={() => {
                          onPath(storageManager.stringifyPath([...path, newFileName]));
                          this.closeNewFileDialog();
                          close();
                        }}>Create</Button>
                      </InputAdornment>,
                    }}
                  />
                </DialogContent>
              </Dialog>
            </Grid>
          </Grid>
        </DialogTitle>
        <FileList />
      </Dialog>
    );
  }
}

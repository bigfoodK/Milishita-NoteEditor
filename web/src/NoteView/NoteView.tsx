import React, { RefObject, createRef } from 'react';
import NoteViewCanvas from './NoteViewCanvas';
import { Card, Typography, CardContent } from '@material-ui/core';
import { world } from './world';
import { dispatch, store } from '~StateStore/store';
import { ConfigAction } from '~StateStore/_gen/config_action.ts';

type NoteViewProps = {

};

type NoteViewState = {

};

export default class NoteView extends React.Component<NoteViewProps, NoteViewState> {
  private noteViewCanvas?: NoteViewCanvas;
  private canvasElement: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>();

  constructor(props: NoteViewProps) {
    super(props);

    this.renewNoteViewCanvas = this.renewNoteViewCanvas.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.renewNoteViewCanvas);
    this.renewNoteViewCanvas();
  }

  componentWillUnmount() {
    this.noteViewCanvas?.destory();
    window.removeEventListener('resize', this.renewNoteViewCanvas);
  }

  private renewNoteViewCanvas() {
    const element = this.canvasElement.current;
    if (!element) {
      return;
    }

    element.width = element.clientWidth;
    element.height = element.clientHeight;

    const { numberBoxWidth } = store.getState().configState;
    dispatch(ConfigAction.setBarWidth(element.clientWidth - 10 - numberBoxWidth))

    this.noteViewCanvas?.destory();
    world.clearChildren();
    this.noteViewCanvas = new NoteViewCanvas(element);
  }

  render() {
    return (
      <Card>
        <CardContent>
          <Typography variant="h3">NoteView</Typography>
        </CardContent>
        <CardContent>
          <canvas style={{ width: '100%', height: '80vh'}} ref={this.canvasElement} />
        </CardContent>
      </Card>
    );
  }
}

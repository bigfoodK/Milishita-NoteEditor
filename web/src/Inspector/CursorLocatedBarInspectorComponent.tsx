import React from 'react';
import { useSelector } from 'react-redux';
import { RootState, store, dispatch } from '~StateStore/store';
import { getBarIndexByBeats } from '~utils/bar';
import { LongNoteAction } from '~StateStore/_gen/longNote_action.ts';
import { BarAction } from '~StateStore/_gen/bar_action.ts';
import ChangeBarBeatComponent from './ChangeBarBeatComponent';
import {ButtonGroup, Button, Container, CardContent } from '@material-ui/core';

export const CursorLocatedBarInspectorComponent = () => {
  const isPlaying = useSelector((state: RootState) => state.playerState.isPlaying);
  const bars = useSelector((state: RootState) => state.barState.bars);
  const beats = store.getState().playerState.cursor.beats
  const barIndex = getBarIndexByBeats(beats);
  if (barIndex < 0) {
    return null;
  }

  const bar = bars.get(barIndex);
  if (!bar) {
    return null;
  }

  const removeBar = () => {
    dispatch(LongNoteAction.removeLongNotesOnBar(bar.id));
    dispatch(BarAction.removeNotesOnBar(barIndex));
    dispatch(BarAction.removeBar(barIndex));
  }

  const insertBar = () => {
    dispatch(BarAction.insertNewBar(barIndex, store.getState().configState.defaultBarBeat));
  }

  const Buttons = () => <ButtonGroup
    fullWidth
  >
    <Button
      disabled={isPlaying}
      onClick={() => { insertBar() }}
    >{`${barIndex}번 마디 아래에 한 마디 추가`}</Button>
    <Button
      disabled={isPlaying}
      onClick={removeBar}
    >{`${barIndex}번 마디 삭제`}</Button>
  </ButtonGroup>

  return (
    <Container disableGutters>
      <CardContent>
        <Buttons />
      </CardContent>
      <CardContent>
        <ChangeBarBeatComponent
          bar={bar}
          barIndex={barIndex}
          isPlaying={isPlaying}
        />
      </CardContent>
      <CardContent>
        <pre>{JSON.stringify(bar, null, 2)}</pre>
      </CardContent>
    </Container>
  );
}
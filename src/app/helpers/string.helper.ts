export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// TEMPORARY FUNCTION; REMOVES NAMESPACE
export function trimStoryId(storyId: string) {
  return storyId.replace('https://utrechttimemachine.nl/stories/', '');
}

export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// TEMPORARY FUNCTION; REMOVES NAMESPACE
export function trimStoryId(storyId: string) {
  return storyId.replace('https://utrechttimemachine.nl/stories/', '');
}

export function indexes(source: string, find: string): number[] {
  if (!source) {
    return [];
  }
  // Return all indexes if the find string is empty
  if (!find) {
    return source.split('').map(function(_, i) {
      return i;
    });
  }
  const result = [];
  for (let i = 0; i < source.length; ++i) {
    if (source.substring(i, i + find.length) === find) {
      result.push(i);
    }
  }
  return result;
}

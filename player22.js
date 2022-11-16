window.addEventListener('message', e => {

  const languages = { 'pt-BR': 'Português (BR)', 'en-US': 'English (US)', 'en-GB': 'English (UK)', 'es-LA': 'Español (LA)', 'es-ES': 'Español (ES)', 'pt-PT': 'Português (PT)', 'fr-FR': 'Français (FR)', 'de-DE': 'Deutsch (DE)', 'ar-ME': '(ME) عربي', 'i-tIT': 'Italiano (IT)', 'ru-RU': 'Русский (RU)', 'hi-IN': 'Fines' };
  const title = e.data.title;
  const thumbnail = e.data.thumbnail;
  const description = e.data.description;
  const videoId = e.data.videoId;
  const userLang = e.data.userLang;
  const streams = e.data.streams;
  const subtitles = e.data.subtitles;

  const sourceLocale = getSourceLocale(userLang);
  const m3u8 = streams[sourceLocale].url;
  const tracks = Object.keys(subtitles).map(getTracks);

  const playerInstance = jwplayer('player');
  playerInstance.setup({
    'title': title,
    'image': thumbnail,
    'file': m3u8,
    'tracks': tracks
  })

  playerInstance.on('ready', () => {
    document.querySelector('#loading-container').style.display = 'none';
  });

  playerInstance.on('time', e => {
    localStorage.setItem(videoId, e.position);
  });

  playerInstance.on('beforePlay', () => {
    const time = parseInt(localStorage.getItem(videoId));
    playerInstance.seek(time);
  });

  playerInstance.on('captionsChanged', e => {
    const { tracks } = e;
    const index = e.track;
    const track = tracks[index].id;
    const [playlist] = playerInstance.getPlaylist();

    playlist.allSources = undefined;
    playlist.file = tracks[index].id;
    playlist.sources = undefined;

    playerInstance.load(playlist);
    playerInstance.play();
  });

  function getSourceLocale(userLang) {
    const streamLang = streams[userLang] ? userLang : '';
    localStorage.setItem('jwplayer.captionLabel', languages[streamLang]);
    return streamLang;
  };

  function getTracks(lang) {
    return { 'kind': 'captions', 'file': streams[lang]['url'], 'label': languages[lang], 'language': lang };
  };
});
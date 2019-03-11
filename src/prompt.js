const { Select } = require('enquirer');

/**
 * @param {module.PluginManager} pm
 * @returns {Promise<boolean>}
 */
// eslint-disable-next-line
module.exports = async (pm) => {
  let choices = [];

  pm.getCommands().forEach((command) => {
    if (!choices.find(c => c.name === command.category)) {
      choices.push({
        name: command.category,
        disabled: '>',
        choices: [],
      });
    }

    choices.find(c => c.name === command.category).choices.push(
      {
        name: command.name,
        value: command.id,
        shortcut: command.shortcut,
      },
    );
  });

  choices = choices.sort((choicea, choiceb) => {
    const orders = [
      {
        name: 'Preview',
        order: 4,
      },
      {
        name: 'Toolchain',
        order: 2,
      },
      {
        name: 'Utility',
        order: 1,
      },
      {
        name: 'Other',
        order: 0,
      },
    ];

    const oa = orders.find(o => o.name === choicea.name);
    const ob = orders.find(o => o.name === choiceb.name);

    return (ob ? ob.order : 0) - (oa ? oa.order : 0);
  });

  // Add invisible separator after each category
  choices.forEach((choice) => {
    choice.choices.push({
      role: 'separator',
      message: '‌‌ ', // invisible char
    });
  });

  // put a space on top
  choices.unshift({
    role: 'separator',
    message: '‌‌ ', // invisible char
  });

  let prompt;
  const questions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do',
    choices,
    result() {
      return this.focused;
    },
  };

  let answers = {};
  try {
    prompt = new Select(questions);

    prompt.on('keypress', (rawKey) => {
      const foc = prompt.state.choices.find(c => c.shortcut && c.shortcut === rawKey);
      if (foc) {
        prompt.state.index = foc.index;
        prompt.submit();
      }
    });

    answers = await prompt.run();

    console.log(); // just crlf

    await pm.get(answers.value).run();
  } catch (e) {
    if (e) console.log('Aborted:', e);
  }
};

const Infraction = require("../../../models/infraction")
const InfractionUtils = require("../../../utils/moderation/infraction")
const Emotes = require("../../../emotes.json")
const Log = require("../../../utils/moderation/log")
const Translator = require("../../../utils/lang/translator")

module.exports = {
	Call: (client, message, args) => {
		if (args[1] === undefined || args[1] === null)
			return message.channel.send(
				`${Emotes.actions.warn} Missing required argument \`\`id\`\`\n${Emotes.other.tools} Correct usage of command: \`\`infraction|inf claim <id>\`\``
			);

		Infraction.findOne(
			{
				infID: args[1],
				guildID: message.guild.id,
			},
			async (err, inf) => {
				if (inf === null || inf === undefined)
					return message.channel.send(
						`Unable to find infraction with the id \`\`${args[1]}\`\` in **${message.guild.name}**`
					);
				let user = await client.users.fetch(args[2] || message.author.id);
				await InfractionUtils.Claim(args[1], message.guild.id, user);

				message.channel.send(
					`${Emotes.other.wrench} Updated infraction \`\`${args[1]}\`\` in **${message.guild.name}**`
				);
				await Log.Mod_action(
					client,
					message.guild.id,
					`${Emotes.other.wrench} Infraction \`\`${args[1]}\`\` was claimed by **${user.username}**#${user.discriminator} \`\`(${user.id})\`\``,
					""
				);
			}
		);
	},
};

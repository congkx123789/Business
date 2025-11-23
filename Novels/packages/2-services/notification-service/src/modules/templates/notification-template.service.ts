import { Injectable, Logger } from "@nestjs/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export type TemplateVariables = Record<string, string | number | undefined>;

export const EMAIL_TEMPLATE_IDS = [
  "purchase-confirmation",
  "subscription-renewal",
  "vip-upgrade",
  "tipping-received",
  "comment-reply",
] as const;

export type EmailTemplateName = (typeof EMAIL_TEMPLATE_IDS)[number];

export const PUSH_TEMPLATE_IDS = [...EMAIL_TEMPLATE_IDS] as const;

export type PushTemplateName = (typeof PUSH_TEMPLATE_IDS)[number];

export interface PushTemplatePayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);
  private readonly emailCache = new Map<string, string>();
  private readonly pushCache = new Map<string, string>();

  renderEmail(template: EmailTemplateName, variables: TemplateVariables = {}) {
    const templateContent = this.getTemplateContent(
      "email",
      template,
      "html",
      this.emailCache
    );
    return this.interpolate(templateContent, variables);
  }

  renderPush(
    template: PushTemplateName,
    variables: TemplateVariables = {}
  ): PushTemplatePayload | null {
    const templateContent = this.getTemplateContent(
      "push",
      template,
      "json",
      this.pushCache
    );
    const compiled = this.interpolate(templateContent, variables);
    try {
      return JSON.parse(compiled) as PushTemplatePayload;
    } catch (error) {
      this.logger.error(
        `Failed to parse push template "${template}": ${
          error instanceof Error ? error.message : error
        }`
      );
      return null;
    }
  }

  private getTemplateContent(
    folder: "email" | "push",
    template: string,
    extension: "html" | "json",
    cache: Map<string, string>
  ) {
    const cacheKey = `${folder}:${template}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as string;
    }

    const candidatePaths = [
      // Primary: compiled assets copied to dist/templates during build
      join(
        __dirname,
        "..",
        "..",
        "..",
        "templates",
        folder,
        `${template}.${extension}`
      ),
      // Fallback: original templates at the package root (useful in dev or when dist/templates missing)
      join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "templates",
        folder,
        `${template}.${extension}`
      ),
    ];

    const templatePath = candidatePaths.find((path) => existsSync(path));

    if (!templatePath) {
      this.logger.warn(
        `Template "${template}" not found in ${candidatePaths.join(", ")}`
      );
      return "";
    }

    const content = readFileSync(templatePath, "utf-8");
    cache.set(cacheKey, content);
    return content;
  }

  private interpolate(template: string, variables: TemplateVariables) {
    return template.replace(/\{\{(.*?)\}\}/g, (_substring, key) => {
      const value = variables[key.trim()];
      return value !== undefined ? String(value) : "";
    });
  }
}



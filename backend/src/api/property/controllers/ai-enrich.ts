import type { Core } from '@strapi/strapi';

const generateDescription = async (aiMetadata: any): Promise<string | null> => {
  strapi.log.info("OPENAI - description generation started (controller)");

  if (
    aiMetadata === null ||
    aiMetadata === undefined ||
    (typeof aiMetadata === 'object' && Object.keys(aiMetadata).length === 0)
  ) {
    strapi.log.warn("OPENAI - ai_metadata is empty, skipping description generation");
    return null;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  strapi.log.info(`OPENAI - OPENAI_API_KEY present: ${Boolean(OPENAI_API_KEY)}`);
  if (!OPENAI_API_KEY) {
    strapi.log.warn("OPENAI - OPENAI_API_KEY is not configured, skipping description generation");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Você é um redator especializado em imóveis de alto padrão no Brasil. Receberá dados de inteligência visual de múltiplas fotos do mesmo imóvel — os dados podem incluir detecção de tipo de ambiente por imagem, resumo de características, resultados de legenda e sinais de condição e qualidade (c1c6 e q1q6). Trate os dados como um conjunto referente à propriedade inteira, não a uma única foto. Se múltiplos ambientes distintos forem detectados com confiança razoável (por exemplo, cozinha, quarto, sala de estar, banheiro), descreva os principais espaços de forma equilibrada, proporcional ao que os dados suportam — a menos que os dados indiquem apenas um ambiente, caso em que descreva somente esse espaço. Use resultados de legenda como suporte descritivo, mas reescreva sempre com suas próprias palavras; nunca copie uma legenda literalmente. Converta rótulos técnicos de características para português natural (por exemplo: stone_countertops → bancadas em pedra, floor_ceiling_windows → janelas do piso ao teto, wood_finish_floor → piso de madeira, kitchen_island → ilha de cozinha, recessed_lighting → iluminação embutida, hardwood_floor → assoalho de madeira, stainless_steel_appliances → eletrodomésticos em aço inox). Atenha-se estritamente ao que os dados suportam. NÃO invente localização, qualidade de bairro, metragem, detalhes de lote, ano de construção, escola, comodidades, eletrodomésticos, materiais, acabamentos, número de quartos ou banheiros, contagens de cômodos, afirmações sobre layout, vistas ou afirmações de estilo de vida não diretamente suportados pelos dados. Se os dados indicarem low_coverage ou que alguma imagem é renderizada ou virtualmente encenada, mantenha o tom conservador e evite afirmar condição, qualidade ou nível de acabamento elevados. Se os dados forem escassos ou superficiais, redija uma descrição conservadora e factual baseada apenas no que está claramente presente — sem simular inteligência mais profunda. Nunca mencione "IA", "metadados", "Restb.ai", "confiança", "pontuação", "renderizado", "virtualmente encenado", "baixa cobertura" ou qualquer referência a dados, análise ou fotos no texto final. Nunca se desculpe por informações ausentes — simplesmente omita o que não é suportado. Evite hipérboles como "enclave de prestígio", "refúgio culinário", "de última geração", "impecável", "inigualável" ou "santuário de luxo". Tom: premium, factual, contido, orientado a benefícios — adequado para o mercado imobiliário de alto padrão no Brasil. Saída: apenas texto corrido em Português do Brasil, sem markdown, 120–180 palavras.',
          },
          {
            role: 'user',
            content: `Escreva uma descrição de anúncio imobiliário em Português do Brasil (120–180 palavras) para este imóvel, usando a inteligência visual multi-imagem abaixo:\n${JSON.stringify(aiMetadata, null, 2)}\n\nDescreva os principais ambientes detectados de forma proporcional ao que os dados suportam. Converta rótulos técnicos de características para português natural. Reescreva quaisquer legendas com suas próprias palavras. Mantenha-se estritamente dentro do que os dados mostram — não invente localização, contagem de cômodos, metragem, comodidades ou afirmações de estilo de vida. Se os dados forem escassos, seja conservador e factual. Texto corrido em Português do Brasil, sem markdown.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    strapi.log.info(`OPENAI - response status: ${response.status} ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      strapi.log.error(`OPENAI - API error (status ${response.status}): ${errorText}`);
      return null;
    }

    const data: any = await response.json();
    const description: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.output_text?.trim() ||
      "";

    strapi.log.info(`OPENAI - parsed description length: ${description.length}`);
    if (!description) {
      strapi.log.warn(`OPENAI - returned empty description. Raw choices: ${JSON.stringify(data?.choices ?? data)?.slice(0, 300)}`);
      return null;
    }

    strapi.log.info(`OPENAI - description preview: ${description.slice(0, 120)}`);
    return description;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      strapi.log.error('OPENAI - API timeout (controller)');
    } else {
      strapi.log.error(`OPENAI - controller error: ${error.message}`);
    }
    return null;
  }
};

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

const aiEnrich = ({ strapi }: { strapi: Core.Strapi }) => ({
  async enrich(ctx: any) {
    const { id } = ctx.params;
    const { imageUrl } = ctx.request.body;

    if (!id) {
      return ctx.badRequest('Property ID is required');
    }

    const property = await strapi.documents('api::property.property').findOne({
      documentId: id,
      populate: ['images'],
    });

    if (!property) {
      return ctx.notFound('Property not found');
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      return ctx.badRequest('Invalid image URL format');
    }

    // Build the list of image URLs to analyze.
    // - If the request body provided an explicit imageUrl, use that single override.
    // - Otherwise, collect ALL of the property's images.
    const baseUrl: string =
      process.env.RENDER_EXTERNAL_URL ||
      strapi.config.get('server.url', '') ||
      'https://aurixa-strapi-staging.onrender.com';

    let imageUrls: string[] = [];

    if (imageUrl) {
      imageUrls = [imageUrl];
    } else if (property.images && (property.images as any[]).length > 0) {
      imageUrls = (property.images as any[])
        .map((img: any) => {
          if (!img || !img.url) return null;
          return img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`;
        })
        .filter((u: string | null): u is string => typeof u === 'string' && u.length > 0);
    }

    if (imageUrls.length === 0) {
      return ctx.badRequest('No image URL provided and property has no images');
    }

    const RESTB_API_KEY = process.env.RESTB_API_KEY;
    if (!RESTB_API_KEY) {
      return ctx.internalServerError('RESTB_API_KEY is not configured');
    }

    const url = `https://property.restb.ai/v1/multianalyze?client_key=${encodeURIComponent(RESTB_API_KEY)}`;
    const endpointForLog = 'POST https://property.restb.ai/v1/multianalyze';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const payload = {
        image_urls: imageUrls,
        solutions: {
          c1c6: null,
          q1q6: null,
          roomtype: 1,
          features: 6,
          caption: null,
        },
      };
      const serializedBody = JSON.stringify(payload);
      const contentLength = Buffer.byteLength(serializedBody);
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': contentLength.toString(),
        'X-Property-ID': id,
        'X-Client-ID': 'aurixa',
      };

      strapi.log.info(`RESTB.AI - ENDPOINT: ${endpointForLog}`);
      strapi.log.info(`RESTB.AI - PROPERTY ID: ${id}`);
      strapi.log.info(`RESTB.AI - IMAGE COUNT: ${imageUrls.length}`);
      strapi.log.info(`RESTB.AI - IMAGE URLS: ${JSON.stringify(imageUrls)}`);
      strapi.log.info(`RESTB.AI - BODY: ${serializedBody}`);

      const restbResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: serializedBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      strapi.log.info(`RESTB.AI - RESPONSE STATUS: ${restbResponse.status}`);
      strapi.log.info(`RESTB.AI - RESPONSE OK: ${restbResponse.ok}`);

      if (!restbResponse.ok) {
        const errorText = await restbResponse.text();
        strapi.log.error(`Restb.ai API error: ${errorText}`);
        return ctx.internalServerError('Failed to analyze image with Restb.ai');
      }

      const rawData = await restbResponse.json();
      const topLevelKeys =
        rawData && typeof rawData === 'object' ? Object.keys(rawData as any) : [];
      const hasResponseKey = Boolean(
        rawData && typeof rawData === 'object' && 'response' in (rawData as any),
      );
      const rawPreview = JSON.stringify(rawData).slice(0, 1500);
      strapi.log.info(`RESTB.AI - TOP-LEVEL KEYS: ${JSON.stringify(topLevelKeys)}`);
      strapi.log.info(`RESTB.AI - HAS data.response: ${hasResponseKey}`);
      strapi.log.info(`RESTB.AI - RAW PREVIEW (<=1500 chars): ${rawPreview}`);

      if ((rawData as any)?.error === true) {
        const errMsg = (rawData as any)?.message ?? '(no message)';
        const errDetails = (rawData as any)?.error_details;
        strapi.log.error(
          `RESTB.AI - API returned error=true for property ${id}: ${errMsg}`,
        );
        if (errDetails !== undefined) {
          strapi.log.error(
            `RESTB.AI - error_details: ${JSON.stringify(errDetails)}`,
          );
        }
        clearTimeout(timeoutId);
        return ctx.badRequest(`Restb.ai error: ${errMsg}`, {
          error_details: errDetails,
        });
      }

      const aiData = (rawData as any)?.response ?? rawData ?? null;
      if (!aiData) {
        strapi.log.warn(`RESTB.AI - parsed aiData is null for property ${id}`);
      }

      const updateData: any = { ai_metadata: aiData };

      const description = await generateDescription(aiData);
      if (description) {
        updateData.ai_description = description;
      } else {
        strapi.log.warn(`No ai_description generated for property ${id} (saving ai_metadata only)`);
      }

      strapi.log.info(`SAVE - property ${id} payload keys: ${Object.keys(updateData).join(', ')}`);

      const updatedProperty = await strapi.documents('api::property.property').update({
        documentId: id,
        data: updateData,
      });

      strapi.log.info(
        `SAVE - property ${id} confirmed. ai_metadata present: ${Boolean((updatedProperty as any)?.ai_metadata)}, ai_description length: ${((updatedProperty as any)?.ai_description || '').length}`,
      );

      return {
        success: true,
        message: 'Property enriched with AI metadata and description',
        data: {
          property: updatedProperty,
          ai_analysis: aiData,
          ai_description: description,
        },
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        strapi.log.error('Restb.ai API timeout');
        return ctx.internalServerError('AI analysis request timed out');
      }
      strapi.log.error('Error calling Restb.ai API:', error);
      return ctx.internalServerError('Failed to process AI enrichment');
    }
  },
});

export default aiEnrich;

class Dash

  ## cheap and cheerful generator for some vaguely periodic test data
  get '/_test_/data/' do
    target    =  params[:target]   || 'unknown'      # name of metric
    to        = (params[:to]       || Time.now).to_i # starting epoch
    from      = (params[:from]     || Time.now-3600).to_i # ending epoch
    step      = (params[:step]     || (to-from<12*3600 ? 10 : 60)).to_i # discretization in sec
    max       = (params[:max]      || 1.0).to_f      # max amplitude
    period    = (params[:period]   || 24*3600).to_i  # periodic over this many secs
    jitter    = (params[:jitter]   || 1.0).to_f      # random jitter amount
    sparsity  = (params[:sparsity] || 0.1).to_f      # probability of a datum being zero
    scale     =  period/(2*Math::PI)                 # scale factor for time range

    epochs = (from-from%step).step(to-to%step, step) # discrete time buckets
    bytesum = target.each_byte.inject(0) { |b, sum| sum += b } # uniq-ish int by metric name

    datapoints = epochs.map do |time|
      r = Random.new(bytesum+time)        # deterministic based on time
      y = if sparsity >= r.rand(0.0..1.0)
            0.0
          else
            jit = r.rand(0.0..jitter) - r.rand(0.0..jitter) # +/- half-amplitude
            (jit + (Math.cos(time/scale) + 1)/2) / 2
          end
      { x: time, y: y * max }
    end

    content_type :json
    [{ name: target, data: datapoints }].to_json
  end

  ## return array of count fake metrics for use with test data
  get '/_test_/find/*' do |count|
    count = 1 if count.empty?

    ## fake word generator
    consonants = 'bcdfghjklmnpqrstvwxy'
    vowels = 'aeiou'
    mkword = lambda do |length|
      length.times.map do |i|
        i.even? ? consonants[rand(21)] : vowels[rand(5)]
      end.join
    end

    ## make count metrics
    metrics = count.to_i.times.map do |x|
      3.times.map { mkword.call(rand(7)+4) }.join('.')
    end

    content_type :json
    metrics.to_json
  end

end
